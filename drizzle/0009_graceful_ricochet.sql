CREATE TABLE "product_filter_bounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pixel_pitch_min" numeric(10, 2) NOT NULL,
	"pixel_pitch_max" numeric(10, 2) NOT NULL,
	"power_consumption_max_min" integer NOT NULL,
	"power_consumption_max_max" integer NOT NULL,
	"power_consumption_typical_min" integer NOT NULL,
	"power_consumption_typical_max" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
