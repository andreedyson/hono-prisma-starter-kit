import { Hono } from "hono";
import { deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { zodValidator } from "../lib/validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service.js";
import { cookieOptions } from "../utils/cookie.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.schema.js";

const router = new Hono().basePath("/api");

router.post("/register", zodValidator("json", registerSchema), async (c) => {
  const payload = c.req.valid("json");

  const user = await registerUser(payload);

  return c.json({
    message: "Successfully registered",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

router.post("/login", zodValidator("json", loginSchema), async (c) => {
  const payload = c.req.valid("json");
  const { user, token } = await loginUser(c, payload);

  return c.json({ message: "Login Successful", data: { user, token } }, 200);
});

router.post("/logout", async (c) => {
  try {
    deleteCookie(c, "authToken", cookieOptions);
    return c.json({ message: "Logout successful" });
  } catch {
    throw new HTTPException(500, { message: "Logout failed" });
  }
});

router.post(
  "/forgot-password",
  zodValidator("json", forgotPasswordSchema),
  async (c) => {
    const { email } = c.req.valid("json");
    await requestPasswordReset(email);
    return c.json({ message: "Reset email sent" }, 200);
  }
);

router.post(
  "/reset-password",
  zodValidator("json", resetPasswordSchema),
  async (c) => {
    const { token, password } = c.req.valid("json");
    await resetPassword(token, password);
    return c.json({ message: "Password has been reset" });
  }
);

router.get("/me", authMiddleware, async (c) => {
  const auth = c.get("auth");

  const user = await getCurrentUser(auth.id);

  return c.json({ message: "Success", data: user }, 200);
});

export default router;
