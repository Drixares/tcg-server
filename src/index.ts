import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { apiRoutes } from "./routers";
import { devRoutes } from "./routers/dev/router";

export const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "TCG Server API",
          version: "1.0.0",
          description: "API for managing trading card game data",
        },
      },
    }),
  )
  .get("/", () => "Welcome on the TCG One Piece API")
  .use(apiRoutes)
  // Development-only endpoint to generate test tokens
  .use(devRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.protocol}://${app.server?.hostname}:${app.server?.port}`,
);
