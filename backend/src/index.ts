import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import shifts from "./routes/shifts";
import onError from "./middlewares/on-error";
import { logger } from "./middlewares/pino-logger";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(logger());

// add better auth middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// add better auth routes handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// add cors middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:3001", "claimly://"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.route("/shifts", shifts);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError(onError);

export default {
  port: 3001,
  fetch: app.fetch,
};

export type AppType = typeof app;
