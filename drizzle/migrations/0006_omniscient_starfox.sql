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
