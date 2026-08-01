import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const massages = pgTable('massages',{
    id: text("id").default(gen_random_uuid).primaryKey().notNull(),
    image: text("image").notNull(),
    order: numeric("order", { mode: "number" }).notNull().default(0),
})


export const MassageSchema = createSelectSchema(massages)
export type MassageType = z.infer<typeof MassageSchema>
