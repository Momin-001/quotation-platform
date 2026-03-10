CREATE TABLE "user_header" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_header_my_enquiry_en" text DEFAULT '' NOT NULL,
	"user_header_my_enquiry_de" text DEFAULT '' NOT NULL,
	"user_header_my_quotation_en" text DEFAULT '' NOT NULL,
	"user_header_my_quotation_de" text DEFAULT '' NOT NULL,
	"user_header_my_account_en" text DEFAULT '' NOT NULL,
	"user_header_my_account_de" text DEFAULT '' NOT NULL,
	"user_header_my_cart_en" text DEFAULT '' NOT NULL,
	"user_header_my_cart_de" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
