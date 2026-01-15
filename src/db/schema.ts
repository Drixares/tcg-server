import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { CardAttributeInfo, CardImages, CardNote } from "../types";

export const cardTypesEnum = pgEnum("card_type", [
  "LEADER",
  "CHARACTER",
  "EVENT",
  "STAGE",
]);

export const sets = pgTable("sets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const cards = pgTable(
  "cards",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    rarity: varchar("rarity", { length: 20 }).notNull(),
    type: cardTypesEnum(),
    name: varchar("name", { length: 255 }).notNull(),
    images: jsonb("images").$type<CardImages>(),
    cost: integer("cost"),
    attribute: jsonb("attribute").$type<CardAttributeInfo | null>(),
    power: integer("power"),
    counter: varchar("counter", { length: 10 }),
    color: varchar("color", { length: 50 }).notNull(),
    family: varchar("family", { length: 500 }),
    ability: text("ability"),
    trigger: text("trigger"),
    setId: integer("set_id").references(() => sets.id),
    notes: jsonb("notes").$type<CardNote[]>(),
  },
  (table) => [
    index("cards_code_idx").on(table.code),
    index("cards_name_idx").on(table.name),
    index("cards_type_idx").on(table.type),
    index("cards_color_idx").on(table.color),
    index("cards_set_id_idx").on(table.setId),
    index("cards_rarity_idx").on(table.rarity),
  ],
);

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type CardSet = typeof sets.$inferSelect;
export type NewCardSet = typeof sets.$inferInsert;
