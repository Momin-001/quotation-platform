ALTER TABLE "enquiry_items" ADD COLUMN "custom_screen_width" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_screen_height" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" DROP COLUMN "custom_dimension";