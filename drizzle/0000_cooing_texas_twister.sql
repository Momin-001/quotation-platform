CREATE TYPE "public"."application" AS ENUM('DOOH', 'Indoor signage', 'Home theater', 'Stadium scoreboard', 'Video cube', 'Conference', 'Stadium Ribbons', 'Corporate Design', 'Staging', 'Virtual Production');--> statement-breakpoint
CREATE TYPE "public"."calibration_method" AS ENUM('no calibration', 'multiple layers chroma', 'multiple layers brightness', 'Brightness', 'chroma');--> statement-breakpoint
CREATE TYPE "public"."chip_bonding" AS ENUM('gold wire', 'cooper wire', 'Flip chip');--> statement-breakpoint
CREATE TYPE "public"."colour_depth" AS ENUM('8', '10', '12');--> statement-breakpoint
CREATE TYPE "public"."control_system" AS ENUM('Colorlight', 'Novastar', 'Brompton', 'LINSN');--> statement-breakpoint
CREATE TYPE "public"."cooling" AS ENUM('convection', 'fan');--> statement-breakpoint
CREATE TYPE "public"."current_gain_control" AS ENUM('4', '8');--> statement-breakpoint
CREATE TYPE "public"."design" AS ENUM('fix', 'mobil');--> statement-breakpoint
CREATE TYPE "public"."driving_method" AS ENUM('common anode', 'common cathode');--> statement-breakpoint
CREATE TYPE "public"."led_technology" AS ENUM('SMD', 'SMD+GOB', 'IMD', 'COB', 'DIP', 'LOB');--> statement-breakpoint
CREATE TYPE "public"."pixel_configuration" AS ENUM('1R1G1B', '2R1G1B');--> statement-breakpoint
CREATE TYPE "public"."pixel_technology" AS ENUM('real', 'virtual');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('AIO systems', 'LED Display single cabinet');--> statement-breakpoint
CREATE TYPE "public"."special_types" AS ENUM('transparent', 'curved', 'floor', 'N/A');--> statement-breakpoint
CREATE TYPE "public"."support" AS ENUM('frontendside', 'backside', 'frontside and backside');--> statement-breakpoint
CREATE TYPE "public"."video_rate" AS ENUM('50/60', '120', '240');--> statement-breakpoint
CREATE TYPE "public"."yes_no" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'super_admin', 'admin');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" text NOT NULL,
	"title_de" text NOT NULL,
	"description_en" text NOT NULL,
	"description_de" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "footer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_de" text DEFAULT '' NOT NULL,
	"our_address_title_en" text DEFAULT '' NOT NULL,
	"our_address_title_de" text DEFAULT '' NOT NULL,
	"quick_links_title_en" text DEFAULT '' NOT NULL,
	"quick_links_title_de" text DEFAULT '' NOT NULL,
	"quick_link_1_en" text DEFAULT '' NOT NULL,
	"quick_link_1_de" text DEFAULT '' NOT NULL,
	"quick_link_2_en" text DEFAULT '' NOT NULL,
	"quick_link_2_de" text DEFAULT '' NOT NULL,
	"quick_link_3_en" text DEFAULT '' NOT NULL,
	"quick_link_3_de" text DEFAULT '' NOT NULL,
	"quick_link_4_en" text DEFAULT '' NOT NULL,
	"quick_link_4_de" text DEFAULT '' NOT NULL,
	"quick_link_5_en" text DEFAULT '' NOT NULL,
	"quick_link_5_de" text DEFAULT '' NOT NULL,
	"newsletter_title_en" text DEFAULT '' NOT NULL,
	"newsletter_title_de" text DEFAULT '' NOT NULL,
	"email_placeholder_en" text DEFAULT '' NOT NULL,
	"email_placeholder_de" text DEFAULT '' NOT NULL,
	"subscribe_button_en" text DEFAULT '' NOT NULL,
	"subscribe_button_de" text DEFAULT '' NOT NULL,
	"copyright_text_en" text DEFAULT '' NOT NULL,
	"copyright_text_de" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_small_label_en" text DEFAULT '' NOT NULL,
	"hero_small_label_de" text DEFAULT '' NOT NULL,
	"hero_title_en" text DEFAULT '' NOT NULL,
	"hero_title_de" text DEFAULT '' NOT NULL,
	"hero_description_en" text DEFAULT '' NOT NULL,
	"hero_description_de" text DEFAULT '' NOT NULL,
	"hero_short_description_en" text DEFAULT '' NOT NULL,
	"hero_short_description_de" text DEFAULT '' NOT NULL,
	"hero_input_placeholder_en" text DEFAULT '' NOT NULL,
	"hero_input_placeholder_de" text DEFAULT '' NOT NULL,
	"hero_primary_button_en" text DEFAULT '' NOT NULL,
	"hero_primary_button_de" text DEFAULT '' NOT NULL,
	"hero_secondary_button_en" text DEFAULT '' NOT NULL,
	"hero_secondary_button_de" text DEFAULT '' NOT NULL,
	"hero_hotline_cta_en" text DEFAULT '' NOT NULL,
	"hero_hotline_cta_de" text DEFAULT '' NOT NULL,
	"hero_request_button_en" text DEFAULT '' NOT NULL,
	"hero_request_button_de" text DEFAULT '' NOT NULL,
	"value_blocks_title_en" text DEFAULT '' NOT NULL,
	"value_blocks_title_de" text DEFAULT '' NOT NULL,
	"value_blocks_subtitle_en" text DEFAULT '' NOT NULL,
	"value_blocks_subtitle_de" text DEFAULT '' NOT NULL,
	"value_block_1_title_en" text DEFAULT '' NOT NULL,
	"value_block_1_title_de" text DEFAULT '' NOT NULL,
	"value_block_1_description_en" text DEFAULT '' NOT NULL,
	"value_block_1_description_de" text DEFAULT '' NOT NULL,
	"value_block_2_title_en" text DEFAULT '' NOT NULL,
	"value_block_2_title_de" text DEFAULT '' NOT NULL,
	"value_block_2_description_en" text DEFAULT '' NOT NULL,
	"value_block_2_description_de" text DEFAULT '' NOT NULL,
	"value_block_3_title_en" text DEFAULT '' NOT NULL,
	"value_block_3_title_de" text DEFAULT '' NOT NULL,
	"value_block_3_description_en" text DEFAULT '' NOT NULL,
	"value_block_3_description_de" text DEFAULT '' NOT NULL,
	"value_block_4_title_en" text DEFAULT '' NOT NULL,
	"value_block_4_title_de" text DEFAULT '' NOT NULL,
	"value_block_4_description_en" text DEFAULT '' NOT NULL,
	"value_block_4_description_de" text DEFAULT '' NOT NULL,
	"how_it_works_title_en" text DEFAULT '' NOT NULL,
	"how_it_works_title_de" text DEFAULT '' NOT NULL,
	"how_it_works_subtitle_en" text DEFAULT '' NOT NULL,
	"how_it_works_subtitle_de" text DEFAULT '' NOT NULL,
	"step_1_title_en" text DEFAULT '' NOT NULL,
	"step_1_title_de" text DEFAULT '' NOT NULL,
	"step_1_description_1_en" text DEFAULT '' NOT NULL,
	"step_1_description_1_de" text DEFAULT '' NOT NULL,
	"step_1_description_2_en" text DEFAULT '' NOT NULL,
	"step_1_description_2_de" text DEFAULT '' NOT NULL,
	"step_2_title_en" text DEFAULT '' NOT NULL,
	"step_2_title_de" text DEFAULT '' NOT NULL,
	"step_2_description_1_en" text DEFAULT '' NOT NULL,
	"step_2_description_1_de" text DEFAULT '' NOT NULL,
	"step_2_description_2_en" text DEFAULT '' NOT NULL,
	"step_2_description_2_de" text DEFAULT '' NOT NULL,
	"step_3_title_en" text DEFAULT '' NOT NULL,
	"step_3_title_de" text DEFAULT '' NOT NULL,
	"step_3_description_1_en" text DEFAULT '' NOT NULL,
	"step_3_description_1_de" text DEFAULT '' NOT NULL,
	"step_3_description_2_en" text DEFAULT '' NOT NULL,
	"step_3_description_2_de" text DEFAULT '' NOT NULL,
	"step_4_title_en" text DEFAULT '' NOT NULL,
	"step_4_title_de" text DEFAULT '' NOT NULL,
	"step_4_description_1_en" text DEFAULT '' NOT NULL,
	"step_4_description_1_de" text DEFAULT '' NOT NULL,
	"step_4_description_2_en" text DEFAULT '' NOT NULL,
	"step_4_description_2_de" text DEFAULT '' NOT NULL,
	"step_5_title_en" text DEFAULT '' NOT NULL,
	"step_5_title_de" text DEFAULT '' NOT NULL,
	"step_5_description_1_en" text DEFAULT '' NOT NULL,
	"step_5_description_1_de" text DEFAULT '' NOT NULL,
	"step_5_description_2_en" text DEFAULT '' NOT NULL,
	"step_5_description_2_de" text DEFAULT '' NOT NULL,
	"cta_card_button_1_en" text DEFAULT '' NOT NULL,
	"cta_card_button_1_de" text DEFAULT '' NOT NULL,
	"cta_card_button_2_en" text DEFAULT '' NOT NULL,
	"cta_card_button_2_de" text DEFAULT '' NOT NULL,
	"faq_title_en" text DEFAULT '' NOT NULL,
	"faq_title_de" text DEFAULT '' NOT NULL,
	"faq_subtitle_en" text DEFAULT '' NOT NULL,
	"faq_subtitle_de" text DEFAULT '' NOT NULL,
	"partners_title_en" text DEFAULT '' NOT NULL,
	"partners_title_de" text DEFAULT '' NOT NULL,
	"partners_subtitle_en" text DEFAULT '' NOT NULL,
	"partners_subtitle_de" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navbar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nav_item_1_en" text DEFAULT '' NOT NULL,
	"nav_item_1_de" text DEFAULT '' NOT NULL,
	"nav_item_2_en" text DEFAULT '' NOT NULL,
	"nav_item_2_de" text DEFAULT '' NOT NULL,
	"nav_item_3_en" text DEFAULT '' NOT NULL,
	"nav_item_3_de" text DEFAULT '' NOT NULL,
	"nav_item_4_en" text DEFAULT '' NOT NULL,
	"nav_item_4_de" text DEFAULT '' NOT NULL,
	"nav_item_5_en" text DEFAULT '' NOT NULL,
	"nav_item_5_de" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo_url" text NOT NULL,
	"website_url" text NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"certificate_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_number" text NOT NULL,
	"viewing_angle_horizontal" text,
	"viewing_angle_vertical" text,
	"brightness_control" text,
	"dci_p3_coverage" text,
	"operating_temperature" text,
	"operating_humidity" text,
	"ip_rating" text,
	"led_modules_per_cabinet" text,
	"product_type" "product_type" NOT NULL,
	"design" "design" NOT NULL,
	"special_types" "special_types" NOT NULL,
	"application" "application" NOT NULL,
	"pixel_configuration" "pixel_configuration" NOT NULL,
	"pixel_technology" "pixel_technology" NOT NULL,
	"led_technology" "led_technology" NOT NULL,
	"chip_bonding" "chip_bonding" NOT NULL,
	"colour_depth" "colour_depth" NOT NULL,
	"current_gain_control" "current_gain_control" NOT NULL,
	"video_rate" "video_rate" NOT NULL,
	"calibration_method" "calibration_method" NOT NULL,
	"driving_method" "driving_method" NOT NULL,
	"control_system" "control_system" NOT NULL,
	"cooling" "cooling" NOT NULL,
	"power_redundancy" "yes_no" NOT NULL,
	"memory_on_module" "yes_no" NOT NULL,
	"smart_module" "yes_no" NOT NULL,
	"support" "support",
	"area_of_use_id" uuid,
	"refresh_rate" integer NOT NULL,
	"scan_rate_numerator" integer DEFAULT 1 NOT NULL,
	"scan_rate_denominator" integer NOT NULL,
	"contrast_ratio_numerator" integer,
	"contrast_ratio_denominator" integer DEFAULT 1,
	"power_consumption_max" integer,
	"power_consumption_typical" integer,
	"warranty_period" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"company_name" text,
	"email" text NOT NULL,
	"phone_number" text,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_area_of_use_id_categories_id_fk" FOREIGN KEY ("area_of_use_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;