import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import type { TwitchJWTPayload } from "../types/twitch";
import { getSecret } from "../utils/get-secret";

const secret = getSecret();

/**
 * Twitch JWT Authentication Middleware
 *
 * Verifies JWT tokens sent from Twitch extension frontend.
 * Adds `twitchUser` to the request context with decoded payload.
 *
 * @example
 * ```ts
 * app.use(twitchAuth).get("/protected", ({ twitchUser }) => {
 *   return { channelId: twitchUser.channel_id };
 * });
 * ```
 */
export const twitchAuth = new Elysia({ name: "twitch-auth" })
  .use(
    jwt({
      name: "jwt",
      secret,
    }),
  )
  .macro({
    auth: {
      async resolve({ status, headers, jwt }) {
        const authHeader = headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
          throw status(401, {
            error: "Missing or invalid authorization token",
          });
        }

        const token = authHeader.slice(7);
        const payload = await jwt.verify(token);

        if (!payload) {
          throw status(401, {
            error: "Missing or invalid authorization token",
          });
        }

        return {
          twitchUser: payload as unknown as TwitchJWTPayload,
        };
      },
    },
  });
