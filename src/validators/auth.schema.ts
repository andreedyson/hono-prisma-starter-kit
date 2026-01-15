import { zValidator } from "@hono/zod-validator";
import z from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Name is requried" })
    .min(1, { error: "Name is required" }),
  email: z.email({ error: "Invalid email" }),
  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" })
    .max(32, {
      error: "Password should be less than or equal to 32 chracters",
    }),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const forgotPasswordSchema = registerSchema.pick({ email: true });
export const resetPasswordSchema = z.object({
  token: z.string().nonempty(),
  password: z
    .string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" })
    .max(32, {
      error: "Password should be less than or equal to 32 chracters",
    }),
});

/* ========== TYPE INFER FROM SCHEMA  ========== */
export type RegisterProps = z.infer<typeof registerSchema>;
export type LoginProps = z.infer<typeof loginSchema>;
export type ForgotPasswordProps = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordProps = z.infer<typeof resetPasswordSchema>;
