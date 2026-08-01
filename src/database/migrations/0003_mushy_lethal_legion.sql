CREATE TABLE "booking_massages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" text NOT NULL,
	"massage_id" text NOT NULL,
	"price" numeric NOT NULL,
	"duration" numeric NOT NULL
);
--> statement-breakpoint
ALTER TABLE "massages" ADD COLUMN "order" numeric DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_massages" ADD CONSTRAINT "booking_massages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "booking_massages" ADD CONSTRAINT "booking_massages_massage_id_massages_id_fk" FOREIGN KEY ("massage_id") REFERENCES "public"."massages"("id") ON DELETE cascade ON UPDATE cascade;