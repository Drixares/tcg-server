import { z } from "zod";

export const getCardsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  color: z.string().optional(),
  rarity: z.string().optional(),
  set: z.string().optional(),
});

export const getCardByIdParamsSchema = z.object({
  id: z.string(),
});

export type GetCardByIdParams = z.infer<typeof getCardByIdParamsSchema>;
export type GetCardsQuery = z.infer<typeof getCardsQuerySchema>;
