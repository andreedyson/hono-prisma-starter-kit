import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z
    .string({
      error: "DATABASE_URL is required",
    })
    .min(1, "DATABASE_URL is required"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int("PORT must be an integer")
    .min(1, "PORT must be between 1 and 65535")
    .max(65535, "PORT must be between 1 and 65535")
    .default(8787),

  JWT_SECRET: z
    .string({ error: "JWT_SECRET is required" })
    .min(10, "JWT_SECRET must be at least 10 characters"),

  JWT_RESET_SECRET: z
    .string({ error: "JWT_RESET_SECRET is required" })
    .min(10, "JWT_RESET_SECRET must be at least 10 characters"),

  // Resend Email
  RESEND_API_KEY: z
    .string({ error: "RESEND_API_KEY is required" })
    .min(1, "RESEND_API_KEY is required"),
  RESEND_FROM: z
    .string({ error: "RESEND_FROM is required" })
    .min(1, "RESEND_FROM is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const flattened = parsed.error.flatten();
  console.error("❌ Invalid environment variables:");
  console.error(flattened.fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
