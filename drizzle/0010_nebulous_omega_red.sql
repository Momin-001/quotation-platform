ALTER TABLE "controllers" ADD COLUMN "price_per_controller_usd" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "stock_pieces" integer;--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "leadtime_days" integer;