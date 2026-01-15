import { readFile } from "fs/promises";
import { join } from "path";
import { db, sets, cards, type NewCard } from "../src/db";
import { eq, sql } from "drizzle-orm";

const DATA_FILE = join(import.meta.dir, "..", "data", "all-cards.json");

const VALID_TYPES = ["LEADER", "CHARACTER", "EVENT", "STAGE"];

interface RawCard {
  id: string;
  code: string;
  rarity: string;
  type: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  cost: number | null;
  attribute: {
    name: string;
    image: string;
  } | null;
  power: number | null;
  counter: string;
  color: string;
  family: string;
  ability: string;
  trigger: string;
  set: {
    name: string;
  };
  notes: { name: string; url: string }[];
}

interface ValidationError {
  cardId: string;
  cardIndex: number;
  field: string;
  message: string;
  value: unknown;
}

function validateCard(card: RawCard, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!card.id) {
    errors.push({
      cardId: card.id || "UNKNOWN",
      cardIndex: index,
      field: "id",
      message: "Missing id",
      value: card.id,
    });
  }

  if (!card.code) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "code",
      message: "Missing code",
      value: card.code,
    });
  }

  if (!card.rarity) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "rarity",
      message: "Missing rarity",
      value: card.rarity,
    });
  }

  if (!card.type) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "type",
      message: "Missing type",
      value: card.type,
    });
  } else if (!VALID_TYPES.includes(card.type)) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "type",
      message: `Invalid type: ${card.type}`,
      value: card.type,
    });
  }

  if (!card.name) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "name",
      message: "Missing name",
      value: card.name,
    });
  }

  if (!card.color) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "color",
      message: "Missing color",
      value: card.color,
    });
  }

  if (!card.set?.name) {
    errors.push({
      cardId: card.id,
      cardIndex: index,
      field: "set.name",
      message: "Missing set name",
      value: card.set,
    });
  }

  return errors;
}

async function main() {
  console.log("=".repeat(60));
  console.log("SEED SCRIPT - Starting");
  console.log("=".repeat(60));

  // Read data
  console.log("\n[1/5] Reading cards data...");
  const rawData = await readFile(DATA_FILE, "utf-8");
  const rawCards: RawCard[] = JSON.parse(rawData);
  console.log(`   Loaded ${rawCards.length} cards from file`);

  // Check for duplicate IDs in source data
  console.log("\n[2/5] Checking for duplicate IDs in source data...");
  const idCounts = new Map<string, number>();
  for (const card of rawCards) {
    idCounts.set(card.id, (idCounts.get(card.id) || 0) + 1);
  }
  const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateIds.length > 0) {
    console.log(
      `   ⚠️  Found ${duplicateIds.length} duplicate IDs in source data:`,
    );
    for (const [id, count] of duplicateIds.slice(0, 10)) {
      console.log(`      - "${id}" appears ${count} times`);
    }
    if (duplicateIds.length > 10) {
      console.log(`      ... and ${duplicateIds.length - 10} more`);
    }
  } else {
    console.log("   ✓ No duplicate IDs found");
  }

  // Validate all cards
  console.log("\n[3/5] Validating cards...");
  const allErrors: ValidationError[] = [];
  const validCards: RawCard[] = [];
  const invalidCards: { card: RawCard; errors: ValidationError[] }[] = [];

  for (let i = 0; i < rawCards.length; i++) {
    const card = rawCards[i];
    const errors = validateCard(card, i);
    if (errors.length > 0) {
      allErrors.push(...errors);
      invalidCards.push({ card, errors });
    } else {
      validCards.push(card);
    }
  }

  if (allErrors.length > 0) {
    console.log(
      `   ⚠️  Found ${allErrors.length} validation errors in ${invalidCards.length} cards:`,
    );

    // Group errors by field
    const errorsByField = new Map<string, ValidationError[]>();
    for (const error of allErrors) {
      const existing = errorsByField.get(error.field) || [];
      existing.push(error);
      errorsByField.set(error.field, existing);
    }

    for (const [field, errors] of errorsByField) {
      console.log(`      - ${field}: ${errors.length} errors`);
      for (const error of errors.slice(0, 3)) {
        console.log(
          `        Card "${error.cardId}" (index ${error.cardIndex}): ${error.message}`,
        );
      }
      if (errors.length > 3) {
        console.log(`        ... and ${errors.length - 3} more`);
      }
    }
  } else {
    console.log("   ✓ All cards are valid");
  }

  console.log(`   Valid cards: ${validCards.length}`);
  console.log(`   Invalid cards (will be skipped): ${invalidCards.length}`);

  // Insert sets
  console.log("\n[4/5] Processing sets...");
  const uniqueSetNames = [...new Set(validCards.map((card) => card.set.name))];
  console.log(`   Found ${uniqueSetNames.length} unique sets`);

  const setIdMap = new Map<string, number>();
  let setsCreated = 0;
  let setsExisting = 0;

  for (const setName of uniqueSetNames) {
    const existing = await db
      .select()
      .from(sets)
      .where(eq(sets.name, setName))
      .limit(1);

    if (existing.length > 0) {
      setIdMap.set(setName, existing[0].id);
      setsExisting++;
    } else {
      const [inserted] = await db
        .insert(sets)
        .values({ name: setName })
        .returning();
      setIdMap.set(setName, inserted.id);
      setsCreated++;
      console.log(`   + Created set: "${setName}" (id: ${inserted.id})`);
    }
  }
  console.log(`   Sets created: ${setsCreated}`);
  console.log(`   Sets already existing: ${setsExisting}`);

  // Insert cards one by one to track conflicts
  console.log("\n[5/5] Inserting cards...");
  let inserted = 0;
  let conflicts = 0;
  let errors = 0;
  const conflictedCards: string[] = [];
  const errorCards: { id: string; error: string }[] = [];

  for (let i = 0; i < validCards.length; i++) {
    const raw = validCards[i];

    const cardData: NewCard = {
      id: raw.id,
      code: raw.code,
      rarity: raw.rarity,
      type: raw.type as NewCard["type"],
      name: raw.name,
      images: raw.images,
      cost: raw.cost,
      attribute: raw.attribute,
      power: raw.power,
      counter: raw.counter,
      color: raw.color,
      family: raw.family,
      ability: raw.ability,
      trigger: raw.trigger,
      setId: setIdMap.get(raw.set.name) ?? null,
      notes: raw.notes,
    };

    try {
      // Check if card already exists
      const existing = await db
        .select({ id: cards.id })
        .from(cards)
        .where(eq(cards.id, raw.id))
        .limit(1);

      if (existing.length > 0) {
        conflicts++;
        conflictedCards.push(raw.id);
      } else {
        await db.insert(cards).values(cardData);
        inserted++;
      }
    } catch (error) {
      errors++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errorCards.push({ id: raw.id, error: errorMessage });
      console.log(`   ✗ Error inserting "${raw.id}": ${errorMessage}`);
    }

    // Progress log
    if ((i + 1) % 500 === 0 || i + 1 === validCards.length) {
      console.log(
        `   Progress: ${i + 1}/${validCards.length} (inserted: ${inserted}, conflicts: ${conflicts}, errors: ${errors})`,
      );
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("SEED SCRIPT - Summary");
  console.log("=".repeat(60));
  console.log(`Total cards in file:     ${rawCards.length}`);
  console.log(`Duplicate IDs in file:   ${duplicateIds.length}`);
  console.log(`Invalid cards (skipped): ${invalidCards.length}`);
  console.log(`Valid cards processed:   ${validCards.length}`);
  console.log(`Cards inserted:          ${inserted}`);
  console.log(`Cards already existing:  ${conflicts}`);
  console.log(`Cards with errors:       ${errors}`);
  console.log(`Sets created:            ${setsCreated}`);
  console.log(`Sets already existing:   ${setsExisting}`);

  // Log conflicts if any
  if (conflicts > 0) {
    console.log(`\nConflicted card IDs (first 20):`);
    for (const id of conflictedCards.slice(0, 20)) {
      console.log(`   - ${id}`);
    }
    if (conflictedCards.length > 20) {
      console.log(`   ... and ${conflictedCards.length - 20} more`);
    }
  }

  // Log errors if any
  if (errorCards.length > 0) {
    console.log(`\nCards with errors:`);
    for (const { id, error } of errorCards) {
      console.log(`   - ${id}: ${error}`);
    }
  }

  // Verify final count in database
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(cards);
  const [setCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(sets);
  console.log(`\nDatabase state:`);
  console.log(`   Total cards in DB: ${countResult.count}`);
  console.log(`   Total sets in DB:  ${setCountResult.count}`);

  console.log("\n" + "=".repeat(60));
  process.exit(0);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
