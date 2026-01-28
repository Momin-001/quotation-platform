CREATE TABLE "quotation_alternative_optional_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alternative_item_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"tax_percentage" numeric(5, 2) DEFAULT '0',
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"description" text,
	"item_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotation_alternative_optional_items" ADD CONSTRAINT "quotation_alternative_optional_items_alternative_item_id_quotation_alternative_items_id_fk" FOREIGN KEY ("alternative_item_id") REFERENCES "public"."quotation_alternative_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_alternative_optional_items" ADD CONSTRAINT "quotation_alternative_optional_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;