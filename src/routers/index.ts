import { Elysia } from "elysia";
import { cardsRoutes } from "./cards/router";

export const apiRoutes = new Elysia({ prefix: "/api" }).use(cardsRoutes);
