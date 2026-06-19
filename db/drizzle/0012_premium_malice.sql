ALTER TABLE "blogs" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "controllers" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "controllers" ADD CONSTRAINT "controllers_slug_unique" UNIQUE("slug");