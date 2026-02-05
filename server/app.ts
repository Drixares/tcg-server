import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { apiRoutes } from "./routers";
import { devRoutes } from "./routers/dev/router";

export const app = new Elysia({ prefix: "/api" })
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
  .use(apiRoutes)
  .use(devRoutes);
