import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { JWT_SECRET } from "../configs/constants.js";

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
  return await sign(data, JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  return (await verify(token, JWT_SECRET)) as JWTPayload;
};
