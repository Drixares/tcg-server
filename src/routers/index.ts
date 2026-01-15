import { Elysia } from "elysia";
import { twitchAuth } from "../middlewares/twitch-auth";
import { cardsRoutes } from "./cards/router";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(twitchAuth)
  .use(cardsRoutes);
