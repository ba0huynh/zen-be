import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";

export const massages = pgTable('massages',{
    id: text("id").default(gen_random_uuid).primaryKey().notNull(),
    image: text("image").notNull(),
})
