ALTER TABLE "quotations" ADD COLUMN "tax_percentage" numeric(5, 2) DEFAULT '19';--> statement-breakpoint
ALTER TABLE "quotation_additional_items" DROP COLUMN "tax_percentage";--> statement-breakpoint
ALTER TABLE "quotation_items" DROP COLUMN "tax_percentage";--> statement-breakpoint
ALTER TABLE "quotation_optional_items" DROP COLUMN "tax_percentage";