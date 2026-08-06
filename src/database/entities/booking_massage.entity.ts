import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import { bookings } from "./booking.entity";
import { massages } from "./massage.entity";
import { createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const bookingMassages = pgTable('booking_massages', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    massageId: text('massage_id').notNull().references(() => massages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    price: numeric('price',{mode:'number'}).notNull(),
    duration: numeric('duration',{mode:'number'}).notNull(),
    quantity: numeric('quantity',{mode:'number'}).notNull().default(1),
})

export const bookingMassageRelation = relations(bookingMassages, ({one}) => ({
    booking: one(bookings, {fields: [bookingMassages.bookingId],references: [bookings.id]}),
    massage: one(massages, {fields: [bookingMassages.massageId],references: [massages.id]}),
}))

export const BookingMassageSchema = createSelectSchema(bookingMassages)
