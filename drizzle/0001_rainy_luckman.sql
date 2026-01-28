ALTER TABLE "products" ADD COLUMN "led_chip_manufacturer" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "white_point_calibration" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "input_voltage" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "receiving_card" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "heat_dissipation" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "monitoring_function_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "monitoring_function_de" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "additional_certification" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "emc" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "safety" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "support_during_warranty_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "support_during_warranty_de" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "support_after_warranty_en" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "support_after_warranty_de" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pixel_pitch" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cabinet_width" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cabinet_height" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight_without_packaging" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cabinet_resolution_horizontal" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cabinet_resolution_vertical" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pixel_density" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "led_lifespan" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "greyscale_processing" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "number_of_colours" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mtbf_power_supply" integer;