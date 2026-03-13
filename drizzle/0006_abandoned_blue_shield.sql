CREATE TABLE "accessory_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"accessory_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accessories" ADD COLUMN "product_datasheet_url" text;--> statement-breakpoint
ALTER TABLE "accessories" ADD COLUMN "optional_field" text[];--> statement-breakpoint
ALTER TABLE "accessory_features" ADD CONSTRAINT "accessory_features_accessory_id_accessories_id_fk" FOREIGN KEY ("accessory_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;