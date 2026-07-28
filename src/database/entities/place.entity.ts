import { pgTable, text } from "drizzle-orm/pg-core";
import { gen_random_uuid, geography } from "../database.constant";

export const places = pgTable('places', {
    id: text('id').primaryKey().default(gen_random_uuid).notNull(),
    location: geography('location').notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
})