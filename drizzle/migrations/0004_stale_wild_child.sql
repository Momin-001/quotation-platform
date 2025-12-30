CREATE TABLE "cms_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value_en" text NOT NULL,
	"value_de" text NOT NULL,
	"section" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_content_key_unique" UNIQUE("key")
);
