CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"package_id" text NOT NULL,
	"vp" integer NOT NULL,
	"base_price" integer NOT NULL,
	"fee" integer NOT NULL,
	"total_price" integer NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_contact" text NOT NULL,
	"recipient_riot_id" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
