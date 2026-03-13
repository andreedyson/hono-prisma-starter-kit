import type { CookieOptions } from "hono/utils/cookie";
import { env } from "../configs/env";
import { ACCESS_TOKEN_TTL } from "./token";

export const AUTH_COOKIE_NAME = "auth";

export const getAllowedOrigins = () =>
  env.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const cookieOptions = {
  httpOnly: true,
  path: "/",
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: ACCESS_TOKEN_TTL, // 1hr
} as CookieOptions;
