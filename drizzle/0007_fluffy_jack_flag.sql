CREATE TABLE "quotation_section_defaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_offer_html" text DEFAULT '' NOT NULL,
	"section_conditions_html" text DEFAULT '' NOT NULL,
	"section_options_html" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "pixel_technology" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pixel_technology";--> statement-breakpoint
CREATE TYPE "public"."pixel_technology" AS ENUM('Real', 'Virtual (Quadruple)', 'Virtual (Triple)');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "pixel_technology" SET DATA TYPE "public"."pixel_technology" USING "pixel_technology"::"public"."pixel_technology";--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "section_offer_html" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "section_conditions_html" text;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "section_options_html" text;