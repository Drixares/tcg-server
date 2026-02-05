import { inArray } from "drizzle-orm";
import { cards, db } from "../server/db";
import { twitchPubSub } from "../server/services/twitch-pubsub";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  // 1. Get a dev token with broadcaster role
  const clientId = process.env.TWITCH_EXTENSION_CLIENT_ID;
  const clientDevId = process.env.TWITCH_DEV_USER_ID;

  const token = twitchPubSub.createEBSToken(clientDevId);

  console.log("Received token response:");
  console.log(JSON.stringify({ token }, null, 2));

  console.log("Got broadcaster token");

  // 2. Send card IDs with positions (cards will be fetched from DB by the server)
  const body = {
    cards: [
      { id: "OP12-109", x: 0.15, y: 0.3 },
      { id: "OP11-089", x: 0.45, y: 0.3 },
      { id: "OP01-029", x: 0.75, y: 0.3 },
      { id: "OP01-002", x: 0.5, y: 0.5 },
    ],
  };

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

  console.log("Sending broadcast request:");
  console.log(JSON.stringify(enrichedCards, null, 2));

  const { success, error } = await twitchPubSub.broadcast(
    clientDevId,
    enrichedCards,
  );

  if (!success) {
    console.error(error);
    process.exit(1);
  }

  console.log("Broadcast sent successfully!");
}

main().catch((err) => {
  console.error("Error in test script:", err);
  process.exit(1);
});

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
