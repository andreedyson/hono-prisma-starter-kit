import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { env } from "../configs/env.js";

interface CustomPayload extends JWTPayload {
  id: string;
  email: string;
  createdAt?: Date;
}

export const generateToken = async (payload: CustomPayload) => {
  const data = {
    ...payload,
    sub: payload.id,
    exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // Expires in 1hr
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
    exp: Math.floor(Date.now() / 1000) + 15 * 60, // Expires in 15m
  };
  return await sign(data, env.JWT_RESET_SECRET);
};

export const verifyResetToken = async (token: string) => {
  return (await verify(token, env.JWT_RESET_SECRET, "HS256")) as CustomPayload;
};
