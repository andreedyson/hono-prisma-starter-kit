import "hono";
import type { CustomPayload } from "../lib/token.ts";

declare module "hono" {
  interface ContextVariableMap {
    auth: CustomPayload;
  }
}
