import type { Context, Env, ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import type { z, ZodError, ZodTypeAny } from "zod";

type Hook<TOut, E extends Env, P extends string> = (
  result:
    | { success: true; data: TOut }
    | { success: false; error: ZodError; data: unknown },
  c: Context<E, P>
) => Response | void | Promise<Response | void> | { response: Response };

export function zodValidator<
  TSchema extends ZodTypeAny,
  Target extends keyof ValidationTargets,
  E extends Env = Env,
  P extends string = string
>(target: Target, schema: TSchema, hook?: Hook<z.output<TSchema>, E, P>) {
  return validator(target, async (value, c) => {
    const parsed = await schema.safeParseAsync(value);

    if (hook) {
      const hookResult = await hook(
        parsed.success
          ? { success: true, data: parsed.data }
          : { success: false, error: parsed.error, data: value },
        c
      );

      if (hookResult) {
        if (hookResult instanceof Response) return hookResult;
        if ("response" in hookResult) return hookResult.response;
      }
    }

    if (!parsed.success) {
      throw new HTTPException(400, {
        message: "Validasi Gagal",
        cause: {
          errors: parsed.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
            code: i.code,
          })),
        },
      });
    }

    return parsed.data;
  });
}
