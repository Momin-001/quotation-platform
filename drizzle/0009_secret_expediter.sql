ALTER TABLE "controllers" ADD COLUMN "controller_number" text;--> statement-breakpoint
ALTER TABLE "controllers" ADD CONSTRAINT "controllers_controller_number_unique" UNIQUE("controller_number");