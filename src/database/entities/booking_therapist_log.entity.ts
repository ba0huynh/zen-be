import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { bookings } from "./booking.entity";
import { therapists } from "./therapist.entity";

export const bookingTherapistLogs = pgTable("booking_therapist_logs", {
    bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    therapistEmail: text("therapist_email").notNull().references(() => therapists.email, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (table) => [primaryKey({ columns: [table.bookingId, table.therapistEmail] })])
