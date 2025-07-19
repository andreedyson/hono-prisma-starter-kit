import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("8787")
    .transform((val) => Number(val)),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_RESET_SECRET: z
    .string()
    .min(10, "JWT_RESET_SECRET must be at least 10 characters"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
