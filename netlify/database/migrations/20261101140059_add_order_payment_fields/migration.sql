ALTER TABLE "orders" ADD COLUMN "payment_key" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp;