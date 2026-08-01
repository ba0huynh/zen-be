import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import z from "zod";
import { createSelectSchema } from "drizzle-zod";
import { Gender, Genders } from "../database.type";

export const bookings = pgTable('bookings', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    createdAt: timestamp('created_at',{withTimezone:true,mode:'string'}).defaultNow().notNull(),
    startTime: timestamp('start_time',{withTimezone:true,mode:'string'}).notNull(),
    phone: text('phone').notNull(),
    address: text('address').notNull(),
    note: text('note'),
    gender: text('gender').$type<Gender>(),
})

export const BookingSchema = createSelectSchema(bookings,{gender: z.enum(Genders)})
export type BookingType = z.infer<typeof BookingSchema>
