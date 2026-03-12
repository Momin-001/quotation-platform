CREATE TABLE "enquiry_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"public_id" text NOT NULL,
	"file_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_item_accessories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_item_id" uuid NOT NULL,
	"accessory_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiries" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_service_access" text;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_mounting_method" text;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_operating_hours" text;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_power_redundancy" text;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_ip_rating" text;--> statement-breakpoint
ALTER TABLE "enquiry_files" ADD CONSTRAINT "enquiry_files_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_item_accessories" ADD CONSTRAINT "enquiry_item_accessories_enquiry_item_id_enquiry_items_id_fk" FOREIGN KEY ("enquiry_item_id") REFERENCES "public"."enquiry_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_item_accessories" ADD CONSTRAINT "enquiry_item_accessories_accessory_id_accessories_id_fk" FOREIGN KEY ("accessory_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;