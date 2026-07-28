import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import { massages } from "./massage.entity";
import z from "zod";
import { createSelectSchema } from "drizzle-zod";

export const bookings = pgTable('bookings', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    massageId: text('massage_id').notNull().references(() => massages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    price: numeric('price',{mode:'number'}).notNull(),
    duration: numeric('duration',{mode:'number'}).notNull(),
    createdAt: timestamp('created_at',{withTimezone:true,mode:'string'}).defaultNow().notNull(),
    startTime: timestamp('start_time',{withTimezone:true,mode:'string'}).notNull(),
    phone: text('phone').notNull(),
    address: text('address').notNull(),
})

export const BookingSchema = createSelectSchema(bookings)
export type BookingType = z.infer<typeof BookingSchema>
