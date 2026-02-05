import { z } from "zod";

export const broadcastCardsBodySchema = z.object({
  cards: z
    .array(
      z.object({
        id: z.string(),
        x: z.number(),
        y: z.number(),
      }),
    )
    .min(1)
    .max(10),
});

export type BroadcastCardsBody = z.infer<typeof broadcastCardsBodySchema>;
