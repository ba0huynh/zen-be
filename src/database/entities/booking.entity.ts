import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { Gender, Genders } from "../database.type";
import { relations } from "drizzle-orm";
import { therapists } from "./therapist.entity";
import { bookingMassages } from "./booking_massage.entity";

export const bookings = pgTable('bookings', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    startTime: timestamp('start_time', { withTimezone: true, mode: 'string' }).notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    room: text('room'),
    tower: text('tower'),
    name: text('name').notNull(),
    address: text('address').notNull(),
    note: text('note'),
    gender: text('gender').$type<Gender>(),
    therapistEmail: text('therapist_email'),
})
export const bookingRelations = relations(bookings, ({ one,many }) => ({
    therapist: one(therapists, { fields: [bookings.therapistEmail], references: [therapists.email] }),
    massages: many(bookingMassages),
}))
export const BookingSchema = createSelectSchema(bookings, { gender: z.enum(Genders) })
export type BookingType = z.infer<typeof BookingSchema>
