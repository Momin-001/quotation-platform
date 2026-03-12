CREATE TYPE "public"."partner_type" AS ENUM('technology', 'marketing');--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "marketing_partners_title_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "marketing_partners_title_de" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "marketing_partners_subtitle_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "marketing_partners_subtitle_de" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "partners" ADD COLUMN "type" "partner_type" DEFAULT 'technology' NOT NULL;