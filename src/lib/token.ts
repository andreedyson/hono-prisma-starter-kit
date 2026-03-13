import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "../configs/env.js";

export interface CustomPayload extends JWTPayload {
  id: string;
  email: string;
  createdAt?: Date;
  fullName?: string;
  role?: string;
  tokenVersion?: number;
}

export const ACCESS_TOKEN_TTL = 6 * 60 * 60; // Expires dalam 6 jam
const RESET_TOKEN_TTL = 15 * 60; // Expires 15 menit
const VERIFY_EMAIL_TOKEN_TTL = 24 * 60 * 60; // Expires 24 jam

export const generateToken = async (payload: CustomPayload) => {
  const data = {
    ...payload,
    sub: payload.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL,
  };
  return await sign(data, env.JWT_SECRET, "HS256");
};

export const verifyToken = async (token: string) => {
  return (await verify(token, env.JWT_SECRET, "HS256")) as CustomPayload;
};

export const generateResetToken = async (payload: CustomPayload) => {
  const data = {
    ...payload,
    sub: payload.id,
    exp: Math.floor(Date.now() / 1000) + RESET_TOKEN_TTL, // Expires in 15m
  };
  return await sign(data, env.JWT_RESET_SECRET);
};

export const verifyResetToken = async (token: string) => {
  return (await verify(token, env.JWT_RESET_SECRET, "HS256")) as CustomPayload;
};

export const generateVerifyEmailToken = async (payload: CustomPayload) => {
  const data = {
    ...payload,
    sub: payload.id,
    exp: Math.floor(Date.now() / 1000) + VERIFY_EMAIL_TOKEN_TTL,
  };
  return await sign(data, env.JWT_VERIFY_SECRET, "HS256");
};

export const verifyEmailToken = async (token: string) => {
  return (await verify(token, env.JWT_VERIFY_SECRET, "HS256")) as CustomPayload;
};
