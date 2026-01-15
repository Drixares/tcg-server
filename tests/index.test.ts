import { treaty } from "@elysiajs/eden";
import { describe, expect, it } from "bun:test";
import { app } from "../src";

const client = treaty(app);

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
    describe("GET /welcome", () => {
        it("returns a welcome response", async () => {
            const { data, status } = await client.welcome.get();

            expect(status).toBe(200);
            expect(data).toBe("Welcome on the TCG One Piece API");
        });
    });

    describe("GET /api/cards", () => {
        describe("pagination", () => {
            it("returns paginated cards with default pagination", async () => {
                const { data, status } = await client.api.cards.get();

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
                });

                expect(status).toBe(200);
                expect(data?.page).toBe(2);
            });

            it("returns cards with custom limit", async () => {
                const { data, status } = await client.api.cards.get({
                    query: { limit: "10" },
                });

                expect(status).toBe(200);
                expect(data?.limit).toBe(10);
                expect(data?.data?.length).toBeLessThanOrEqual(10);
            });

            it("respects max limit of 100", async () => {
                const { data, status } = await client.api.cards.get({
                    query: { limit: "500" },
                });

                expect(status).toBe(200);
                expect(data?.limit).toBe(100);
            });

            it("handles invalid page gracefully (defaults to 1)", async () => {
                const { data, status } = await client.api.cards.get({
                    query: { page: "-1" },
                });

                expect(status).toBe(200);
                expect(data?.page).toBe(1);
            });

            it("handles invalid limit gracefully (defaults to minimum 1)", async () => {
                const { data, status } = await client.api.cards.get({
                    query: { limit: "0" },
                });

                expect(status).toBe(200);
                expect(data?.limit).toBeGreaterThanOrEqual(1);
            });
        });

        describe("filters", () => {
            it("filters cards by name", async () => {
                const { data, status } = await client.api.cards.get({
                    query: { name: "Luffy" },
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
                });

                expect(status).toBe(200);

                if (data?.data && data.data.length > 0) {
                    const card = data.data[0];

                    expect(Object.keys(card)).toEqual(
                        expect.arrayContaining(CARD_KEYS),
                    );
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
            });

            if (listResponse.data?.data && listResponse.data.data.length > 0) {
                const cardId = listResponse.data.data[0].id;
                const { data, status } = await client.api
                    .cards({ id: cardId })
                    .get();

                expect(status).toBe(200);
                expect(data?.id).toBe(cardId);
                expect(data?.name).toBeDefined();
                expect(data?.type).toBeDefined();
            }
        });

        it("returns 404 when card is not found", async () => {
            const { status, error } = await client.api
                .cards({ id: "non-existent-card-id-12345" })
                .get();

            expect(status).toBe(404);
        });

        it("returns correct card structure", async () => {
            const listResponse = await client.api.cards.get({
                query: { limit: "1" },
            });

            if (listResponse.data?.data && listResponse.data.data.length > 0) {
                const cardId = listResponse.data.data[0].id;
                const { data, status } = await client.api
                    .cards({ id: cardId })
                    .get();

                expect(status).toBe(200);
                expect(Object.keys(data!)).toEqual(
                    expect.arrayContaining(CARD_KEYS),
                );
            }
        });
    });
});
