import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";
import prisma from "../db/prisma.js";
import {
  generateResetToken,
  generateToken,
  verifyResetToken,
} from "../utils/token.js";
import type { AuthProps } from "../validators/auth.schema.js";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { cookieOptions } from "../utils/cookie.js";
import { sendResetPasswordEmail } from "../utils/email.js";

export const registerUser = async (data: AuthProps) => {
  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (userExists) {
      throw new HTTPException(409, { message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create new user data
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return newUser;
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Unexpected error:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
};

export const loginUser = async (c: Context, data: AuthProps) => {
  try {
    // Check user data
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User is not registered" });
    }

    // Check is password correct
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new HTTPException(401, { message: "Invalid credentials provided" });
    }

    // Generate JWT Token using the payload
    const payload = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };

    const token = await generateToken(payload);

    // Set cookie with httpOnly option
    setCookie(c, "authToken", token, cookieOptions);

    return { user: payload, token };
  } catch (error) {
    if (error instanceof HTTPException) throw error;
    console.error("Unexpected error:", error);
    throw new HTTPException(500, { message: "Internal server error" });
  }
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new HTTPException(404, { message: "Email not found" });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = await generateResetToken(payload);

  await sendResetPasswordEmail(email, token);

  return true;
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const payload = await verifyResetToken(token);
    const newHashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: payload.id },
      data: {
        password: newHashedPassword,
      },
    });
  } catch (error) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }
};
