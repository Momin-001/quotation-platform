DROP TABLE "enquiry_item_accessories" CASCADE;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_installation_and_service" jsonb;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_structural_width" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_structural_height" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_structural_depth" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_viewing_distance_min" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_viewing_distance_max" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_controller_config" jsonb;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_network_connection" jsonb;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_signal_source_inputs" jsonb;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "custom_additional_services" jsonb;--> statement-breakpoint
ALTER TABLE "enquiry_items" DROP COLUMN "custom_service_access";