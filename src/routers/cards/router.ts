import { Elysia } from "elysia";
import { twitchAuth } from "../../middlewares/twitch-auth";
import { cardsController } from "./handler";
import { getCardByIdParamsSchema, getCardsQuerySchema } from "./validators";

export const cardsRoutes = new Elysia({ prefix: "/cards" })
  .use(twitchAuth)
  .get(
    "/",
    async ({ query }) => {
      return await cardsController.getAll(query);
    },
    {
      auth: true,
      query: getCardsQuerySchema,
    },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const card = await cardsController.getById(params.id);

      if (!card) {
        throw status(404);
      }

      return card;
    },
    {
      auth: true,
      params: getCardByIdParamsSchema,
    },
  );
