import bcrypt from "bcryptjs";
import { HTTPException } from "hono/http-exception";
import {
  generateResetToken,
  generateToken,
  verifyResetToken,
} from "../lib/token.js";
import type { LoginProps, RegisterProps } from "../validators/auth.schema.js";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { AUTH_COOKIE_NAME, cookieOptions } from "../lib/cookie.js";
import { sendResetPasswordEmail } from "../lib/email.js";
import { prisma } from "../db/prisma.js";
import type { UserRole } from "../../prisma/generated/prisma/enums.js";

const buildAuthPayload = (user: {
  id: string;
  email: string;
  createdAt: Date;
  tokenVersion: number;
  role: UserRole;
}) => ({
  id: user.id,
  email: user.email,
  fullName: "Name", // Adjust with how you want to approach name retrieval
  role: user.role,
  createdAt: user.createdAt,
  tokenVersion: user.tokenVersion,
});

export const registerUser = async (data: RegisterProps) => {
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

    // Create new user data
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
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

export const loginUser = async (c: Context, data: LoginProps) => {
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
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HTTPException(400, { message: "Invalid credentials provided" });
    }

    // Generate JWT Token using the payload
    const payload = buildAuthPayload(user);
    const token = await generateToken(payload);
    // Set cookie with httpOnly option
    setCookie(c, AUTH_COOKIE_NAME, token, cookieOptions);

    return { user: payload };
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

export const getCurrentUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    });

    return user;
  } catch (error) {
    throw new HTTPException(400, { message: "Gagal mendapatkan data user" });
  }
};
