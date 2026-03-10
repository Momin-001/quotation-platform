CREATE TABLE "product_icons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"public_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_product_icons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"product_icon_id" uuid NOT NULL,
	"icon_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_product_icons" ADD CONSTRAINT "product_product_icons_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_product_icons" ADD CONSTRAINT "product_product_icons_product_icon_id_product_icons_id_fk" FOREIGN KEY ("product_icon_id") REFERENCES "public"."product_icons"("id") ON DELETE cascade ON UPDATE no action;