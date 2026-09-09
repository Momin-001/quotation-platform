ALTER TABLE "accessories" ADD COLUMN "profit_margin" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "profit_margin" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "accessories" DROP COLUMN "retail_price";