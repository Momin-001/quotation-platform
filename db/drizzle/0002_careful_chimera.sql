CREATE TYPE "public"."optional_no" AS ENUM('Optional', 'No');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "power_redundancy" "optional_no";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "memory_on_module" "optional_no";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "smart_module" "optional_no";