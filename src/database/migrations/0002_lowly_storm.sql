ALTER TABLE "bookings" DROP CONSTRAINT "bookings_massage_id_massages_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "massage_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "duration";