import type { MiddlewareHandler } from "hono";
import { verifyToken } from "../utils/token.js";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await verifyToken(token);
    c.set("jwtPayload", decoded);
    await next();
  } catch (error) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};
