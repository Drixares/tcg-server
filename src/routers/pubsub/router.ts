import { inArray } from "drizzle-orm";
import { Elysia } from "elysia";
import { cards, db } from "../../db";
import { twitchAuth } from "../../middlewares/twitch-auth";
import { twitchPubSub } from "../../services/twitch-pubsub";
import { broadcastCardsBodySchema } from "./validators";

export const pubsubRoutes = new Elysia({ prefix: "/pubsub" })
  .use(twitchAuth)
  .post(
    "/broadcast",
    async ({ body, twitchUser, status }) => {
      if (
        twitchUser.role !== "broadcaster" &&
        twitchUser.role !== "external"
      ) {
        throw status(403, { error: "Only broadcasters can send broadcasts" });
      }

      const cardIds = body.cards.map((c) => c.id);
      const dbCards = await db
        .select()
        .from(cards)
        .where(inArray(cards.id, cardIds));

      const dbCardsMap = new Map(dbCards.map((c) => [c.id, c]));

      const enrichedCards = body.cards.map((entry) => {
        const card = dbCardsMap.get(entry.id);
        if (!card) return null;

        return {
          x: entry.x,
          y: entry.y,
          card_data: {
            type: card.type?.toLowerCase() ?? "character",
            color: card.color ?? undefined,
            hp: card.power ?? 0,
            id: card.id,
            big_number_top_left: card.cost ?? 0,
            title: card.name,
            subtitle: card.family ?? "",
            effects: parseEffects(card.ability, card.trigger),
          },
        };
      });

      const validCards = enrichedCards.filter(Boolean);

      if (validCards.length === 0) {
        throw status(404, { error: "No matching cards found in database" });
      }

      const result = await twitchPubSub.broadcast(twitchUser.channel_id, {
        type: "cards",
        cards: validCards,
      });

      if (!result.success) {
        throw status(500, { error: result.error });
      }

      return { success: true };
    },
    {
      auth: true,
      body: broadcastCardsBodySchema,
    },
  );

function parseEffects(
  ability: string | null,
  trigger: string | null,
): { type: string; description: string }[] {
  const effects: { type: string; description: string }[] = [];

  if (ability) {
    const blockerMatch = ability.match(/\[Blocker\]/i);
    if (blockerMatch) {
      effects.push({ type: "blocker", description: "This card can block." });
    }

    const onPlayMatch = ability.match(/\[On Play\]\s*(.*?)(?=\[|$)/is);
    if (onPlayMatch) {
      effects.push({ type: "on_play", description: onPlayMatch[1].trim() });
    }

    const counterMatch = ability.match(/\[Counter\]\s*(.*?)(?=\[|$)/is);
    if (counterMatch) {
      effects.push({ type: "counter", description: counterMatch[1].trim() });
    }

    if (effects.length === 0 && ability.trim()) {
      effects.push({ type: "trigger", description: ability.trim() });
    }
  }

  if (trigger) {
    effects.push({ type: "trigger", description: trigger.trim() });
  }

  return effects;
}
