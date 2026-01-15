import type { CookieOptions } from "hono/utils/cookie";

export const cookieOptions = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 3600, // 1hr
} as CookieOptions;
