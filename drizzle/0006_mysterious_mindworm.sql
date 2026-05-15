ALTER TABLE "categories" ADD COLUMN "title_en" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "title_de" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description_en" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description_de" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "public_id" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "description";