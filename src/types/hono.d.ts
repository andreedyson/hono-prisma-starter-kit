import "hono";
import type { CustomPayload } from "../utils/token.ts";

declare module "hono" {
  interface ContextVariableMap {
    auth: CustomPayload;
  }
}
