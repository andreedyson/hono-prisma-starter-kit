import { Hono } from "hono";
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from "../validators/auth.schema.js";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../services/auth.service.js";
import { cookieOptions } from "../utils/cookie.js";
import { deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

const router = new Hono().basePath("/api");

router.post("/register", registerValidator, async (c) => {
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

router.post("/login", loginValidator, async (c) => {
  const payload = c.req.valid("json");
  const { user, token } = await loginUser(c, payload);

  return c.json({ message: "Login Successful", data: { user, token } });
});

router.post("/logout", async (c) => {
  try {
    deleteCookie(c, "authToken", cookieOptions);
    return c.json({ message: "Logout successful" });
  } catch {
    throw new HTTPException(500, { message: "Logout failed" });
  }
});

router.post("/forgot-password", forgotPasswordValidator, async (c) => {
  const { email } = c.req.valid("json");
  await requestPasswordReset(email);
  return c.json({ message: "Reset email sent" }, 200);
});

router.post("/reset-password", resetPasswordValidator, async (c) => {
  const { token, password } = c.req.valid("json");
  await resetPassword(token, password);
  return c.json({ message: "Password has been reset" });
});

export default router;
