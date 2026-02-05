CREATE TYPE "public"."card_type" AS ENUM('LEADER', 'CHARACTER', 'EVENT', 'STAGE');--> statement-breakpoint
CREATE TABLE "cards" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"rarity" varchar(20) NOT NULL,
	"type" "card_type",
	"name" varchar(255) NOT NULL,
	"images" jsonb,
	"cost" integer,
	"attribute" jsonb,
	"power" integer,
	"counter" varchar(10),
	"color" varchar(50) NOT NULL,
	"family" varchar(500),
	"ability" text,
	"trigger" text,
	"set_id" integer,
	"notes" jsonb
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "sets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cards_code_idx" ON "cards" USING btree ("code");--> statement-breakpoint
CREATE INDEX "cards_name_idx" ON "cards" USING btree ("name");--> statement-breakpoint
CREATE INDEX "cards_type_idx" ON "cards" USING btree ("type");--> statement-breakpoint
CREATE INDEX "cards_color_idx" ON "cards" USING btree ("color");--> statement-breakpoint
CREATE INDEX "cards_set_id_idx" ON "cards" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX "cards_rarity_idx" ON "cards" USING btree ("rarity");