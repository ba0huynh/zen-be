CREATE EXTENSION IF NOT EXISTS postgis;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "massage_pricing" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"massage_id" text NOT NULL,
	"price" numeric NOT NULL,
	"duration" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"massage_id" text NOT NULL,
	"price" numeric NOT NULL,
	"duration" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "massage_translations" (
	"massage_id" text NOT NULL,
	"name" text NOT NULL,
	"language_code" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "massage_translations_massage_id_language_code_pk" PRIMARY KEY("massage_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "massages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location" "geography" NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_massage_id_massages_id_fk" FOREIGN KEY ("massage_id") REFERENCES "public"."massages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "massage_translations" ADD CONSTRAINT "massage_translations_massage_id_massages_id_fk" FOREIGN KEY ("massage_id") REFERENCES "public"."massages"("id") ON DELETE cascade ON UPDATE cascade;