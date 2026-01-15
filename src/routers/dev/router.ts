import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
import { getSecret } from "../../utils/get-secret";

export const devRoutes = new Elysia({ prefix: "/dev" })
  .use(jwt({ name: "jwt", secret: getSecret() }))
  .get("/token", async ({ jwt }) => {
    if (Bun.env.NODE_ENV === "production") {
      return { error: "Not available in production" };
    }
    const token = await jwt.sign({
      exp: Math.floor(Date.now() / 1000) + 3600,
      opaque_user_id: "U123456",
      channel_id: "12345",
      role: "viewer",
    });
    return { token };
  });
