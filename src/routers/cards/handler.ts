import { and, eq, ilike, sql, type SQL } from "drizzle-orm";
import { cards, db, sets, type Card } from "../../db";
import type { ApiCard, ApiPaginatedResponse, CardType } from "../../types";
import {
  createPaginatedResponse,
  getPaginationMeta,
  parsePaginationParams,
} from "../../utils/pagination";

interface GetCardsQuery {
  page?: string;
  limit?: string;
  name?: string;
  type?: string;
  color?: string;
  rarity?: string;
  set?: string;
}

export class CardsController {
  private cardToApiCard(card: Card, setName: string | null): ApiCard {
    return {
      id: card.id,
      code: card.code,
      rarity: card.rarity,
      type: card.type!,
      name: card.name,
      images: card.images!,
      cost: card.cost,
      attribute: card.attribute ?? null,
      power: card.power,
      counter: card.counter ?? "",
      color: card.color,
      family: card.family ?? "",
      ability: card.ability ?? "",
      trigger: card.trigger ?? "",
      set: { name: setName ?? "" },
      notes: card.notes ?? [],
    };
  }

  private buildWhereClause(query: GetCardsQuery): SQL | undefined {
    const conditions: SQL[] = [];

    if (query.name) {
      conditions.push(ilike(cards.name, `%${query.name}%`));
    }
    if (query.type) {
      conditions.push(eq(cards.type, query.type as CardType));
    }
    if (query.color) {
      conditions.push(eq(cards.color, query.color));
    }
    if (query.rarity) {
      conditions.push(eq(cards.rarity, query.rarity));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async getAll(query: GetCardsQuery): Promise<ApiPaginatedResponse<ApiCard>> {
    const paginationParams = parsePaginationParams(query);
    const { offset, limit } = getPaginationMeta(paginationParams);
    const whereClause = this.buildWhereClause(query);

    const [cardResults, countResult] = await Promise.all([
      db
        .select({
          card: cards,
          setName: sets.name,
        })
        .from(cards)
        .leftJoin(sets, eq(cards.setId, sets.id))
        .where(whereClause)
        .orderBy(cards.id)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(cards)
        .where(whereClause),
    ]);

    const total = Number(countResult[0].count);
    const data = cardResults.map((row) =>
      this.cardToApiCard(row.card, row.setName),
    );

    return createPaginatedResponse(data, total, paginationParams);
  }

  async getById(id: string): Promise<ApiCard | null> {
    const result = await db
      .select({
        card: cards,
        setName: sets.name,
      })
      .from(cards)
      .leftJoin(sets, eq(cards.setId, sets.id))
      .where(eq(cards.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.cardToApiCard(result[0].card, result[0].setName);
  }
}

export const cardsController = new CardsController();
