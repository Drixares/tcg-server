import { Elysia } from "elysia";
import { cardsRoutes } from "./cards/router";
import { pubsubRoutes } from "./pubsub/router";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(cardsRoutes)
  .use(pubsubRoutes);
