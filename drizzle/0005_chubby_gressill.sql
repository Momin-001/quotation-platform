CREATE TABLE "blog_content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blog_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"text_html" text DEFAULT '' NOT NULL,
	"image_url" text,
	"image_public_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author_name" text NOT NULL,
	"main_image_url" text,
	"main_image_public_id" text,
	"main_content_html" text DEFAULT '' NOT NULL,
	"partner_ad_image_url" text,
	"partner_ad_image_public_id" text,
	"partner_ad_link_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "blogs_section_title_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "blogs_section_title_de" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "blogs_section_subtitle_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "homepage" ADD COLUMN "blogs_section_subtitle_de" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_content_blocks" ADD CONSTRAINT "blog_content_blocks_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;