import { zValidator } from "@hono/zod-validator";
import z from "zod";

export const registerSchema = z.object({
  // TODO: Add a name field
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
export type AuthProps = z.infer<typeof registerSchema | typeof loginSchema>;
export type ForgotPasswordProps = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordProps = z.infer<typeof resetPasswordSchema>;

/* ========== SCHEMA VALIDATORS  ========== */
export const registerValidator = zValidator(
  "json",
  registerSchema,
  (result, c) => {
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);

      return c.json(
        {
          success: false,
          message: "Register Validation failed",
          errors,
        },
        400
      );
    }
  }
);

export const loginValidator = zValidator("json", loginSchema, (result, c) => {
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);

    return c.json(
      {
        success: false,
        message: "Login Validation failed",
        errors,
      },
      400
    );
  }
});

export const forgotPasswordValidator = zValidator(
  "json",
  forgotPasswordSchema,
  (result, c) => {
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);

      return c.json(
        {
          success: false,
          message: "Forgot Password Validation failed",
          errors,
        },
        400
      );
    }
  }
);

export const resetPasswordValidator = zValidator(
  "json",
  resetPasswordSchema,
  (result, c) => {
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);

      return c.json(
        {
          success: false,
          message: "Reset Password Validation failed",
          errors,
        },
        400
      );
    }
  }
);
