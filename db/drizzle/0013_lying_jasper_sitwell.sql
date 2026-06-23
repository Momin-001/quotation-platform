CREATE TABLE "page_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_key" text NOT NULL,
	"title_en" text DEFAULT '' NOT NULL,
	"title_de" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_de" text DEFAULT '' NOT NULL,
	"noindex" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_seo_page_key_unique" UNIQUE("page_key")
);
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_title_en" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_title_de" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_description_en" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_description_de" text;--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "meta_title_en" text;--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "meta_title_de" text;--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "meta_description_en" text;--> statement-breakpoint
ALTER TABLE "controllers" ADD COLUMN "meta_description_de" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_title_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_title_de" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_description_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "meta_description_de" text;