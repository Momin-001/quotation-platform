CREATE TYPE "public"."refurb_led_technology" AS ENUM('SMD', 'SMD+GOB', 'IMD', 'COB', 'DIP', 'LOB', 'MIP', 'Other');--> statement-breakpoint
CREATE TYPE "public"."refurb_level_of_quality" AS ENUM('Okay', 'Good', 'Excellent');--> statement-breakpoint
CREATE TYPE "public"."refurb_product_type" AS ENUM('Complete System', 'LED Display Single Cabinet');--> statement-breakpoint
CREATE TYPE "public"."refurb_service" AS ENUM('Frontside and Backside', 'Frontside', 'Backside');--> statement-breakpoint
CREATE TYPE "public"."refurb_special_types" AS ENUM('Standard', 'Transparent', 'Curved', 'Floor', 'LED pendant');--> statement-breakpoint
CREATE TYPE "public"."yes_no" AS ENUM('Yes', 'No');--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"public_id" text NOT NULL,
	"redirect_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refurbished_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serie" text NOT NULL,
	"product_number" text NOT NULL,
	"slug" text NOT NULL,
	"product_description" text,
	"oem_brand" text,
	"meta_title_en" text,
	"meta_title_de" text,
	"meta_description_en" text,
	"meta_description_de" text,
	"product_type" "refurb_product_type",
	"area_of_use_id" uuid,
	"design" "design",
	"special_types" "refurb_special_types",
	"year_of_construction" integer,
	"operating_hours" text,
	"pixel_pitch" numeric(10, 2),
	"cabinet_width" numeric(10, 2),
	"cabinet_height" numeric(10, 2),
	"cabinet_resolution_horizontal" integer,
	"cabinet_resolution_vertical" integer,
	"weight_without_packaging" numeric(10, 2),
	"led_technology" "refurb_led_technology",
	"led_technology_other" text,
	"led_chip_manufacturer" text,
	"chip_bonding" "chip_bonding",
	"brightness_value" text,
	"led_driver" text,
	"input_voltage" text,
	"power_consumption_max" integer,
	"power_consumption_typical" integer,
	"refresh_rate" integer,
	"scan_rate" text,
	"control_system" "control_system",
	"control_system_other" text,
	"controller" text,
	"ip_rating" text,
	"service" "refurb_service",
	"hanging_brackets" "yes_no",
	"stacking_system" "yes_no",
	"flight_cases" "yes_no",
	"accessories" text,
	"price_per_cabinet_usd" numeric(12, 2),
	"price_per_metre_square_usd" numeric(12, 2),
	"selling_price" numeric(12, 2),
	"stock_location" text,
	"stock_pieces" integer,
	"leadtime_days" integer,
	"notes" text,
	"level_of_quality" "refurb_level_of_quality",
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refurbished_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "refurbished_product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refurbished_product_id" uuid,
	"public_id" text NOT NULL,
	"image_url" text NOT NULL,
	"image_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refurbished_product_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"refurbished_product_id" uuid NOT NULL,
	"feature" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiry_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "refurbished_product_id" uuid;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD COLUMN "product_source_type" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD COLUMN "refurbished_product_id" uuid;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD COLUMN "product_source_type" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "refurbished_products" ADD CONSTRAINT "refurbished_products_area_of_use_id_categories_id_fk" FOREIGN KEY ("area_of_use_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refurbished_product_images" ADD CONSTRAINT "refurbished_product_images_refurbished_product_id_refurbished_products_id_fk" FOREIGN KEY ("refurbished_product_id") REFERENCES "public"."refurbished_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refurbished_product_features" ADD CONSTRAINT "refurbished_product_features_refurbished_product_id_refurbished_products_id_fk" FOREIGN KEY ("refurbished_product_id") REFERENCES "public"."refurbished_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_refurbished_product_id_refurbished_products_id_fk" FOREIGN KEY ("refurbished_product_id") REFERENCES "public"."refurbished_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_refurbished_product_id_refurbished_products_id_fk" FOREIGN KEY ("refurbished_product_id") REFERENCES "public"."refurbished_products"("id") ON DELETE cascade ON UPDATE no action;