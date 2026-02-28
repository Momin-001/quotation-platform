ALTER TABLE "enquiry_items" ADD COLUMN "item_type" text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "item_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "controller_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_controller_id_controllers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "public"."controllers"("id") ON DELETE set null ON UPDATE no action;