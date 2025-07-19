import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

export const errorHandler = (err: unknown, c: Context) => {
  if (err instanceof HTTPException) {
    const message = err.message || "Something went wrong";
    const errors = err.cause;
    return c.json({ message, errors }, err.status);
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        message: "Validation failed",
        errors: err.issues,
      },
      400
    );
  }

  console.log(err);

  // Default unexpected error
  return c.json({ message: "Internal Server Error" }, 500);
};
