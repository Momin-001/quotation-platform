ALTER TABLE "products" ADD COLUMN "oem_brand" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "led_driver" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "power_supply" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_per_cabinet_usd" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_per_metre_square_usd" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock_pieces" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "leadtime_days" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "monitoring_function_de";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "support_during_warranty_de";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "support_after_warranty_de";