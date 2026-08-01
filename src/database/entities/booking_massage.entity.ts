import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import { bookings } from "./booking.entity";
import { massages } from "./massage.entity";
import { createSelectSchema } from "drizzle-zod";

export const bookingMassages = pgTable('booking_massages', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    bookingId: text('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    massageId: text('massage_id').notNull().references(() => massages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    price: numeric('price',{mode:'number'}).notNull(),
    duration: numeric('duration',{mode:'number'}).notNull(),
})

export const BookingMassageSchema = createSelectSchema(bookingMassages)
