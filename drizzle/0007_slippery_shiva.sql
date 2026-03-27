ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "company_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "commercial_register_number" text;