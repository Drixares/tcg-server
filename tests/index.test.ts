import { treaty } from "@elysiajs/eden";
import { beforeAll, describe, expect, it } from "bun:test";
import { app } from "../server/app";

const client = treaty(app);

// Token for authenticated requests
let authToken: string | undefined;
let broadcasterToken: string | undefined;

// Helper to create authenticated headers
const authHeaders = () => ({
  authorization: `Bearer ${authToken}`,
});

const broadcasterHeaders = () => ({
  authorization: `Bearer ${broadcasterToken}`,
});

const CARD_KEYS = [
  "id",
  "code",
  "rarity",
  "type",
  "name",
  "images",
  "cost",
  "attribute",
  "power",
  "counter",
  "color",
  "family",
  "ability",
  "trigger",
  "set",
  "notes",
];

const PAGINATION_KEYS = ["page", "limit", "total", "totalPages", "data"];

describe("TCG Server API", () => {
  // Get auth tokens before running tests
  beforeAll(async () => {
    const [viewerResponse, broadcasterResponse] = await Promise.all([
      client.api.dev.token.get(),
      client.api.dev.token.get({ query: { role: "broadcaster" } }),
    ]);
    authToken = viewerResponse.data?.token;
    broadcasterToken = broadcasterResponse.data?.token;
  });

  describe("Authentication", () => {
    it("returns 401 when no token is provided", async () => {
      const { status } = await client.api.cards.get();
      expect(status).toBe(401);
    });

    it("returns 401 when invalid token is provided", async () => {
      const { status } = await client.api.cards.get({
        headers: { authorization: "Bearer invalid_token" },
      });
      expect(status).toBe(401);
    });

    it("returns 200 when valid token is provided", async () => {
      const { status } = await client.api.cards.get({
        headers: authHeaders(),
      });
      expect(status).toBe(200);
    });
  });

  describe("GET /api/cards", () => {
    describe("pagination", () => {
      it("returns paginated cards with default pagination", async () => {
        const { data, status } = await client.api.cards.get({
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(Object.keys(data!)).toEqual(
          expect.arrayContaining(PAGINATION_KEYS),
        );
        expect(data?.page).toBe(1);
        expect(data?.limit).toBe(20);
        expect(Array.isArray(data?.data)).toBe(true);
      });

      it("returns cards with custom page", async () => {
        const { data, status } = await client.api.cards.get({
          query: { page: "2" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.page).toBe(2);
      });

      it("returns cards with custom limit", async () => {
        const { data, status } = await client.api.cards.get({
          query: { limit: "10" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.limit).toBe(10);
        expect(data?.data?.length).toBeLessThanOrEqual(10);
      });

      it("respects max limit of 100", async () => {
        const { data, status } = await client.api.cards.get({
          query: { limit: "500" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.limit).toBe(100);
      });

      it("handles invalid page gracefully (defaults to 1)", async () => {
        const { data, status } = await client.api.cards.get({
          query: { page: "-1" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.page).toBe(1);
      });

      it("handles invalid limit gracefully (defaults to minimum 1)", async () => {
        const { data, status } = await client.api.cards.get({
          query: { limit: "0" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.limit).toBeGreaterThanOrEqual(1);
      });
    });

    describe("filters", () => {
      it("filters cards by name", async () => {
        const { data, status } = await client.api.cards.get({
          query: { name: "Luffy" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toBeDefined();
        if (data?.data && data.data.length > 0) {
          data.data.forEach((card) => {
            expect(card.name.toLowerCase()).toContain("luffy");
          });
        }
      });

      it("filters cards by type", async () => {
        const { data, status } = await client.api.cards.get({
          query: { type: "LEADER" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toBeDefined();
        if (data?.data && data.data.length > 0) {
          data.data.forEach((card) => {
            expect(card.type).toBe("LEADER");
          });
        }
      });

      it("filters cards by color", async () => {
        const { data, status } = await client.api.cards.get({
          query: { color: "Red" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toBeDefined();
        if (data?.data && data.data.length > 0) {
          data.data.forEach((card) => {
            expect(card.color).toBe("Red");
          });
        }
      });

      it("filters cards by rarity", async () => {
        const { data, status } = await client.api.cards.get({
          query: { rarity: "SR" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toBeDefined();
        if (data?.data && data.data.length > 0) {
          data.data.forEach((card) => {
            expect(card.rarity).toBe("SR");
          });
        }
      });

      it("combines multiple filters", async () => {
        const { data, status } = await client.api.cards.get({
          query: { type: "CHARACTER", color: "Red" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toBeDefined();
        if (data?.data && data.data.length > 0) {
          data.data.forEach((card) => {
            expect(card.type).toBe("CHARACTER");
            expect(card.color).toBe("Red");
          });
        }
      });

      it("returns empty data array when no cards match filters", async () => {
        const { data, status } = await client.api.cards.get({
          query: { name: "nonexistentcardname12345" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);
        expect(data?.data).toEqual([]);
        expect(data?.total).toBe(0);
      });
    });

    describe("response structure", () => {
      it("returns cards with correct structure", async () => {
        const { data, status } = await client.api.cards.get({
          query: { limit: "1" },
          headers: authHeaders(),
        });

        expect(status).toBe(200);

        if (data?.data && data.data.length > 0) {
          const card = data.data[0];

          expect(Object.keys(card)).toEqual(expect.arrayContaining(CARD_KEYS));
          expect(Object.keys(card.images)).toEqual(
            expect.arrayContaining(["small", "large"]),
          );
          expect(Object.keys(card.set)).toEqual(
            expect.arrayContaining(["name"]),
          );
        }
      });
    });
  });

  describe("GET /api/cards/:id", () => {
    it("returns a card by id", async () => {
      const listResponse = await client.api.cards.get({
        query: { limit: "1" },
        headers: authHeaders(),
      });

      if (listResponse.data?.data && listResponse.data.data.length > 0) {
        const cardId = listResponse.data.data[0].id;
        const { data, status } = await client.api
          .cards({ id: cardId })
          .get({ headers: authHeaders() });

        expect(status).toBe(200);
        expect(data?.id).toBe(cardId);
        expect(data?.name).toBeDefined();
        expect(data?.type).toBeDefined();
      }
    });

    it("returns 401 when no token is provided for card by id", async () => {
      const { status } = await client.api.cards({ id: "EB01-001" }).get();

      expect(status).toBe(401);
    });

    it("returns 404 when card is not found", async () => {
      const { status } = await client.api
        .cards({ id: "non-existent-card-id-12345" })
        .get({ headers: authHeaders() });

      expect(status).toBe(404);
    });

    it("returns correct card structure", async () => {
      const listResponse = await client.api.cards.get({
        query: { limit: "1" },
        headers: authHeaders(),
      });

      if (listResponse.data?.data && listResponse.data.data.length > 0) {
        const cardId = listResponse.data.data[0].id;
        const { data, status } = await client.api
          .cards({ id: cardId })
          .get({ headers: authHeaders() });

        expect(status).toBe(200);
        expect(Object.keys(data!)).toEqual(expect.arrayContaining(CARD_KEYS));
      }
    });
  });

  describe("POST /api/pubsub/broadcast", () => {
    const validCard = { id: "EB01-001", x: 0.5, y: 0.5 };

    describe("authentication", () => {
      it("returns 401 when no token is provided", async () => {
        const { status } = await client.api.pubsub.broadcast.post({
          cards: [validCard],
        });
        expect(status).toBe(401);
      });

      it("returns 401 when invalid token is provided", async () => {
        const { status } = await client.api.pubsub.broadcast.post(
          { cards: [validCard] },
          { headers: { authorization: "Bearer invalid_token" } },
        );
        expect(status).toBe(401);
      });
    });

    describe("authorization", () => {
      it("returns 403 when viewer tries to broadcast", async () => {
        const { status } = await client.api.pubsub.broadcast.post(
          { cards: [validCard] },
          { headers: authHeaders() },
        );
        expect(status).toBe(403);
      });
    });

    describe("validation", () => {
      it("returns 422 when cards array is empty", async () => {
        const { status } = await client.api.pubsub.broadcast.post(
          { cards: [] },
          { headers: broadcasterHeaders() },
        );
        expect(status).toBe(422);
      });

      it("returns 422 when cards array has more than 10 items", async () => {
        const cards = Array.from({ length: 11 }, (_, i) => ({
          id: `card-${i}`,
          x: 0,
          y: 0,
        }));
        const { status } = await client.api.pubsub.broadcast.post(
          { cards },
          { headers: broadcasterHeaders() },
        );
        expect(status).toBe(422);
      });

      it("returns 422 when cards is not provided", async () => {
        const { status } = await client.api.pubsub.broadcast.post({} as any, {
          headers: broadcasterHeaders(),
        });
        expect(status).toBe(422);
      });
    });
  });
});
