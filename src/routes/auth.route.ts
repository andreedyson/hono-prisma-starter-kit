import { Hono } from "hono";
import {
  loginValidator,
  registerValidator,
} from "../validators/auth.schema.js";
import { loginUser, registerUser } from "../services/auth.service.js";
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

export default router;
