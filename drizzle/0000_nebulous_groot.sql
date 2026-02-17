CREATE TYPE "public"."role" AS ENUM('user', 'super_admin', 'admin');--> statement-breakpoint
CREATE TYPE "public"."application" AS ENUM('DOOH', 'Indoor Signage', 'Home Theater', 'Stadium Scoreboard', 'Video Cube', 'Conference', 'Stadium Ribbons', 'Corporate Design', 'Staging', 'Virtual Production');--> statement-breakpoint
CREATE TYPE "public"."calibration_method" AS ENUM('No Calibration', 'Multiple Layers Chroma', 'Multiple Layers Brightness', 'Brightness', 'Chroma', 'Other');--> statement-breakpoint
CREATE TYPE "public"."chip_bonding" AS ENUM('Gold Wire', 'Copper Wire', 'Flip-Chip');--> statement-breakpoint
CREATE TYPE "public"."colour_depth" AS ENUM('8', '10', '12');--> statement-breakpoint
CREATE TYPE "public"."control_system" AS ENUM('Colorlight', 'Novastar', 'Brompton', 'LINSN', 'Other');--> statement-breakpoint
CREATE TYPE "public"."cooling" AS ENUM('Convection', 'Fan');--> statement-breakpoint
CREATE TYPE "public"."current_gain_control" AS ENUM('4', '8');--> statement-breakpoint
CREATE TYPE "public"."design" AS ENUM('Fix', 'Mobil');--> statement-breakpoint
CREATE TYPE "public"."driving_method" AS ENUM('Common Anode', 'Common Cathode');--> statement-breakpoint
CREATE TYPE "public"."greyscale_processing" AS ENUM('<16', '16', '18+', '22+', 'Other');--> statement-breakpoint
CREATE TYPE "public"."led_technology" AS ENUM('SMD', 'SMD+GOB', 'IMD', 'COB', 'DIP', 'LOB', 'Other');--> statement-breakpoint
CREATE TYPE "public"."pixel_configuration" AS ENUM('1R1G1B', '2R1G1B');--> statement-breakpoint
CREATE TYPE "public"."pixel_technology" AS ENUM('Real', 'Virtual');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('AIO Systems', 'LED Display Single Cabinet');--> statement-breakpoint
CREATE TYPE "public"."special_types" AS ENUM('Transparent', 'Curved', 'Floor', 'Other');--> statement-breakpoint
CREATE TYPE "public"."support" AS ENUM('Frontendside', 'Backside', 'Frontside and Backside');--> statement-breakpoint
CREATE TYPE "public"."video_rate" AS ENUM('50/60', '120', '240');--> statement-breakpoint
CREATE TYPE "public"."yes_no" AS ENUM('Yes', 'No');--> statement-breakpoint
CREATE TABLE "accessories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_number" text NOT NULL,
	"short_text" text,
	"long_text" text,
	"product_group" text NOT NULL,
	"unit" text,
	"manufacturer" text,
	"supplier" text,
	"purchase_price" numeric(10, 2),
	"retail_price" numeric(10, 2),
	"lead_time" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accessories_product_number_unique" UNIQUE("product_number")
);
--> statement-breakpoint
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
CREATE TABLE "controllers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_name" text NOT NULL,
	"product_number" text NOT NULL,
	"brand_name" text,
	"interface_name" text,
	"pixel_capacity" integer,
	"max_width_height" integer,
	"dp_1_2" integer DEFAULT 0,
	"hdmi_2_0" integer DEFAULT 0,
	"hdmi_1_3" integer DEFAULT 0,
	"dvi_single_link" integer DEFAULT 0,
	"sdi_12g" integer DEFAULT 0,
	"sdi_3g" integer DEFAULT 0,
	"optical_fiber_in_10g" integer DEFAULT 0,
	"usb_3_0_media_playback" integer DEFAULT 0,
	"gigabit_ethernet_rj45" integer DEFAULT 0,
	"optical_fiber_out_10g" integer DEFAULT 0,
	"output_5g" text,
	"hdmi_1_3_monitoring" integer DEFAULT 0,
	"connector_3d_mini_din_4" integer DEFAULT 0,
	"hdmi_2_0_loop" integer DEFAULT 0,
	"sdi_12g_loop" integer DEFAULT 0,
	"sdi_3g_loop" integer DEFAULT 0,
	"dvi_loop" integer DEFAULT 0,
	"audio_input_3_5mm" integer DEFAULT 0,
	"audio_output_3_5mm" integer DEFAULT 0,
	"ethernet_control_port" integer DEFAULT 0,
	"usb_type_b_pc_control" integer DEFAULT 0,
	"usb_type_a_cascading" integer DEFAULT 0,
	"genlock_in_loop" integer DEFAULT 0,
	"rs_232" integer DEFAULT 0,
	"maximum_layers" text,
	"layer_scaling" text,
	"hdr_support" text,
	"color_depth_bit" integer,
	"low_latency" text,
	"fibre_converter_mode" text,
	"v_can_support" text,
	"backup_mode" text,
	"genlock_sync" text,
	"multi_viewer_mvr" text,
	"usb_playback" text,
	"support_3d" text,
	"purchase_price" numeric(10, 2),
	"retail_price" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "controllers_product_number_unique" UNIQUE("product_number")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"custom_led_technology" text,
	"custom_brightness_value" text,
	"custom_pixel_pitch" numeric(10, 2),
	"custom_refresh_rate" integer,
	"custom_resolution_horizontal" integer,
	"custom_resolution_vertical" integer,
	"custom_cabinet_width" numeric(10, 2),
	"custom_cabinet_height" numeric(10, 2),
	"custom_screen_width" numeric(10, 2),
	"custom_screen_height" numeric(10, 2),
	"custom_total_resolution_h" integer,
	"custom_total_resolution_v" integer,
	"custom_weight" numeric(10, 2),
	"custom_display_area" numeric(10, 4),
	"custom_dimension" text,
	"custom_power_consumption_max" numeric(10, 2),
	"custom_power_consumption_typ" numeric(10, 2),
	"custom_total_cabinets" integer,
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
	"led_chip_manufacturer" text,
	"white_point_calibration" text,
	"input_voltage" text,
	"receiving_card" text,
	"heat_dissipation" text,
	"monitoring_function_en" text,
	"monitoring_function_de" text,
	"additional_certification" text,
	"emc" text,
	"safety" text,
	"support_during_warranty_en" text,
	"support_during_warranty_de" text,
	"support_after_warranty_en" text,
	"support_after_warranty_de" text,
	"product_type" "product_type" NOT NULL,
	"design" "design" NOT NULL,
	"special_types" "special_types" NOT NULL,
	"special_types_other" text,
	"application" "application" NOT NULL,
	"pixel_pitch" numeric(10, 2) NOT NULL,
	"pixel_configuration" "pixel_configuration" NOT NULL,
	"pixel_technology" "pixel_technology" NOT NULL,
	"led_technology" "led_technology" NOT NULL,
	"led_technology_other" text,
	"chip_bonding" "chip_bonding" NOT NULL,
	"colour_depth" "colour_depth" NOT NULL,
	"current_gain_control" "current_gain_control" NOT NULL,
	"video_rate" "video_rate" NOT NULL,
	"brightness_value" text,
	"calibration_method" "calibration_method" NOT NULL,
	"calibration_method_other" text,
	"driving_method" "driving_method" NOT NULL,
	"control_system" "control_system" NOT NULL,
	"control_system_other" text,
	"cooling" "cooling" NOT NULL,
	"power_redundancy" "yes_no" NOT NULL,
	"memory_on_module" "yes_no" NOT NULL,
	"smart_module" "yes_no" NOT NULL,
	"support" "support",
	"area_of_use_id" uuid,
	"cabinet_width" numeric(10, 2),
	"cabinet_height" numeric(10, 2),
	"weight_without_packaging" numeric(10, 2),
	"refresh_rate" integer NOT NULL,
	"scan_rate_numerator" integer DEFAULT 1 NOT NULL,
	"scan_rate_denominator" integer NOT NULL,
	"contrast_ratio_numerator" integer,
	"contrast_ratio_denominator" integer DEFAULT 1,
	"cabinet_resolution_horizontal" integer,
	"cabinet_resolution_vertical" integer,
	"pixel_density" integer,
	"led_lifespan" integer,
	"greyscale_processing" "greyscale_processing",
	"greyscale_processing_other" text,
	"number_of_colours" integer,
	"mtbf_power_supply" integer,
	"power_consumption_max" integer,
	"power_consumption_typical" integer,
	"warranty_period" integer,
	"is_active" boolean DEFAULT false NOT NULL,
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
CREATE TABLE "product_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"certificate_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"feature" text NOT NULL,
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
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"tax_percentage" numeric(5, 2) DEFAULT '0',
	"discount_percentage" numeric(5, 2) DEFAULT '0',
	"description" text,
	"item_type" text DEFAULT 'main' NOT NULL,
	"item_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_role" text NOT NULL,
	"message" text NOT NULL,
	"is_read" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotation_optional_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_item_id" uuid NOT NULL,
	"product_id" uuid,
	"controller_id" uuid,
	"accessory_id" uuid,
	"item_source_type" text DEFAULT 'product' NOT NULL,
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
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"quotation_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_area_of_use_id_categories_id_fk" FOREIGN KEY ("area_of_use_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certificates" ADD CONSTRAINT "product_certificates_certificate_id_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_messages" ADD CONSTRAINT "quotation_messages_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_optional_items" ADD CONSTRAINT "quotation_optional_items_quotation_item_id_quotation_items_id_fk" FOREIGN KEY ("quotation_item_id") REFERENCES "public"."quotation_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_optional_items" ADD CONSTRAINT "quotation_optional_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_optional_items" ADD CONSTRAINT "quotation_optional_items_controller_id_controllers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "public"."controllers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotation_optional_items" ADD CONSTRAINT "quotation_optional_items_accessory_id_accessories_id_fk" FOREIGN KEY ("accessory_id") REFERENCES "public"."accessories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;