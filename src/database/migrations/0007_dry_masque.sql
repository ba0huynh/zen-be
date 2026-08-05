CREATE TABLE "booking_therapist_logs" (
	"booking_id" text NOT NULL,
	"therapist_email" text NOT NULL,
	CONSTRAINT "booking_therapist_logs_booking_id_therapist_email_pk" PRIMARY KEY("booking_id","therapist_email")
);
--> statement-breakpoint
CREATE TABLE "therapists" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "therapist_email" text;--> statement-breakpoint
ALTER TABLE "booking_therapist_logs" ADD CONSTRAINT "booking_therapist_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "booking_therapist_logs" ADD CONSTRAINT "booking_therapist_logs_therapist_email_therapists_email_fk" FOREIGN KEY ("therapist_email") REFERENCES "public"."therapists"("email") ON DELETE cascade ON UPDATE cascade;