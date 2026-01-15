import { Elysia } from "elysia";
import { cardsController } from "./handler";
import { getCardByIdParamsSchema, getCardsQuerySchema } from "./validators";

export const cardsRoutes = new Elysia({ prefix: "/cards" })
    .get(
        "/",
        async ({ query }) => {
            return await cardsController.getAll(query);
        },
        {
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
            params: getCardByIdParamsSchema,
        },
    );
