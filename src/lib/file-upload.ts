import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
  statfsSync,
} from "fs";
import { join, normalize } from "path";
import { v7 as uuidv7 } from "uuid";
import z from "zod";

type Options = {
  prefix?: string;

  /**
   * Path to the directory inside uploads where files should be saved.
   * Must start with "/".
   * @example "/modul" | "/materi" | "/modul/materi"
   * @default "/"
   */
  path?: `/${string}`;

  /**
   * Optional safety guard: minimum free disk space required before writing.
   * @default 500MB
   */
  minFreeBytes?: number;
};

const UPLOADS_ROOT = "./uploads";

export const toMB = (n: number) => n * 1024 * 1024;
export const toGB = (n: number) => n * 1024 * 1024 * 1024;

const DEFAULT_MAX_SIZE = toMB(10); // 10 MB
const DEFAULT_MIN_FREE = toMB(500); // 500 MB

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Prevent path traversal and force staying inside uploads root.
 */
function safeJoinUploadsRoot(subPath?: string) {
  const rootAbs = normalize(join(process.cwd(), UPLOADS_ROOT));
  const targetAbs = normalize(join(rootAbs, subPath ?? ""));

  if (!targetAbs.startsWith(rootAbs)) {
    throw new Error("Invalid path: must remain within the uploads directory");
  }
  return targetAbs;
}

function getExtensionSafe(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1 || idx === fileName.length - 1) return "bin";
  return fileName.slice(idx + 1).toLowerCase();
}

function buildFileName(originalName: string, prefix?: string) {
  const extension = getExtensionSafe(originalName);
  const timeStamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${prefix ?? ""}${timeStamp}-${uuidv7()}.${extension}`;
}

function assertEnoughDiskSpace(targetDirAbs: string, minFreeBytes: number) {
  const { bavail, bsize } = statfsSync(targetDirAbs);
  const freeBytes = bavail * bsize;

  if (freeBytes < minFreeBytes) {
    const freeMB = Math.floor(freeBytes / 1024 / 1024);
    const neededMB = Math.floor(minFreeBytes / 1024 / 1024);
    throw new Error(
      `Insufficient storage. Free: ~${freeMB}MB, minimum required: ~${neededMB}MB`,
    );
  }
}

/**
 * Save files into ./uploads (optionally into subfolder path).
 * Returns both relative fileName (for DB) and absolute-ish path (server path).
 */
export const writeFilesIntoStatic = async (
  files: File[],
  options?: Options,
) => {
  ensureDir(UPLOADS_ROOT);

  if (options?.path && !options.path.startsWith("/")) {
    throw new Error("Path must start with '/'");
  }

  // Convert "/modul/materi" -> "modul/materi"
  const subDir =
    options?.path && options.path !== "/"
      ? options.path.replace(/^\/+/, "").replace(/\/+$/, "")
      : "";

  const storeDirAbs = safeJoinUploadsRoot(subDir);
  ensureDir(storeDirAbs);

  // Optional disk guard
  assertEnoughDiskSpace(storeDirAbs, options?.minFreeBytes ?? DEFAULT_MIN_FREE);

  const fileNames = files.map((file) =>
    buildFileName(file.name, options?.prefix),
  );

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = fileNames[i];

    // NOTE: This buffers the file in memory before writing.
    // With your validation limits (e.g., <= 10MB), it's generally fine.
    const bytes = Buffer.from(await file.arrayBuffer());

    writeFileSync(join(storeDirAbs, fileName), bytes);
  }

  return fileNames.map((name) => {
    const relative =
      subDir.length > 0 ? `${subDir.replace(/\\/g, "/")}/${name}` : name;

    return {
      fileName: relative, // store this in DB (relative to uploads root)
      path: join(storeDirAbs, name), // server filesystem path
    };
  });
};

export const removeFilesFromStatic = async (fileNames: string[]) => {
  for (const fileName of fileNames) {
    // fileName should be relative like "bimbingan/abc.pdf"
    const safePath = fileName.replace(/^\/+/, "");
    const fullPath = safeJoinUploadsRoot(safePath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }
};

interface ValidateFileOptions {
  allowedExtensions: string[];
  allowedMimeTypes?: string[];
  maxSizeInBytes?: number;
  maxFiles?: number;
  minFiles?: number;
}

export const validateSingleFileSchema = ({
  allowedExtensions,
  allowedMimeTypes,
  maxSizeInBytes = DEFAULT_MAX_SIZE,
}: ValidateFileOptions) =>
  z
    .custom<File>((val) => val instanceof File && !!(val as File).name, {
      message: "Invalid file",
    })
    .refine((file) => file.size <= maxSizeInBytes, {
      message: `File size must not exceed ${Math.round(maxSizeInBytes / 1024 / 1024)}MB`,
    })
    .refine(
      (file) =>
        allowedExtensions.some((ext) =>
          file.name.toLowerCase().endsWith(`.${ext.toLowerCase()}`),
        ),
      { message: `Allowed file formats: ${allowedExtensions.join(", ")}` },
    )
    .refine(
      (file) => !allowedMimeTypes || allowedMimeTypes.includes(file.type),
      { message: "Invalid file type" },
    );

export const validateMultiFileSchema = (options: ValidateFileOptions) =>
  z.preprocess(
    (val) => (val instanceof File ? [val] : val), // normalize single File to array
    z
      .array(validateSingleFileSchema(options))
      .min(options.minFiles ?? 1, {
        message: `At least ${options.minFiles ?? 1} file required`,
      })
      .max(options.maxFiles ?? 10, {
        message: `At most ${options.maxFiles ?? 10} files allowed`,
      }),
  );

/**
 * Example presets (optional)
 */
export const imageUploadRules = {
  allowedExtensions: ["png", "jpg", "jpeg", "webp"],
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  maxSizeInBytes: toMB(2),
};

export const pdfUploadRules = {
  allowedExtensions: ["pdf"],
  allowedMimeTypes: ["application/pdf"],
  maxSizeInBytes: toMB(10),
};
