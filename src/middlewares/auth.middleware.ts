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
    c.set("auth", decoded);

    // Enable If You Need RBAC
    //  if (allowedRoles && !allowedRoles.includes(decoded.role as UserRole)) {
    //    return c.json({ message: "Unauthorized Role" }, 403);
    //  }

    await next();
  } catch (error) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
};
