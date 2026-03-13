import type { MiddlewareHandler } from "hono";
import { verifyToken } from "../lib/token.js";
import type { UserRole } from "../../prisma/generated/prisma/enums.js";
import { getCookie } from "hono/cookie";
import { AUTH_COOKIE_NAME } from "../lib/cookie.js";
import { prisma } from "../db/prisma.js";

const getRequestToken = (authHeader?: string, authCookie?: string) => {
  if (authCookie) return authCookie;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const authMiddleware = (
  allowedRoles?: UserRole[] | UserRole,
): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const authCookie = getCookie(c, AUTH_COOKIE_NAME);
    const token = getRequestToken(authHeader, authCookie);

    if (!token) {
      return c.json({ message: "Akses tidak diizinkan" }, 401);
    }

    try {
      const decoded = await verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { tokenVersion: true, role: true },
      });

      if (!user) {
        return c.json({ message: "Akses tidak diizinkan" }, 401);
      }

      if (
        typeof decoded.tokenVersion !== "number" ||
        user.tokenVersion !== decoded.tokenVersion
      ) {
        return c.json({ message: "Token tidak valid atau kadaluarsa" }, 401);
      }

      c.set("auth", { ...decoded, role: user.role });

      if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
        return c.json(
          { message: "Anda tidak memiliki akses untuk data ini" },
          403,
        );
      }

      await next();
    } catch (error) {
      return c.json({ message: "Token tidak valid atau kadaluarsa" }, 401);
    }
  };
};
