CREATE TYPE "public"."greyscale_processing" AS ENUM('<16', '16', '18+', '22+', 'other');--> statement-breakpoint
ALTER TYPE "public"."control_system" ADD VALUE 'other';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "control_system_other" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "greyscale_processing_other" text;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "control_system";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "greyscale_processing";