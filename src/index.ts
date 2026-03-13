import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { env } from "./configs/env.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import { getAllowedOrigins } from "./lib/cookie.js";

const app = new Hono();
const allowedOrigins = new Set(getAllowedOrigins());

app.use(
  cors({
    origin: (origin) => {
      if (!origin) return "";

      return allowedOrigins.has(origin) ? origin : "";
    },
    credentials: true,
  }),
);
app.use("*", logger());
app.use("*", prettyJSON());

app.route("/", authRoutes);
app.get("/api/me", authMiddleware(), async (c) => {
  const user = c.get("jwtPayload");

  return c.json({ message: "You are authenticated", user });
});

app.get("/", (c) => {
  return c.text("Hello Hono Prisma + PostgreSQL Starter Kit !");
});

app.onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
