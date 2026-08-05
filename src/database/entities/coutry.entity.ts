import { pgTable, text } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const countries = pgTable("countries", ({
    name: text("name").notNull(),
    flags: text("flags").notNull(),
    callingCodes: text("callingCodes").notNull().primaryKey(),
}))
export const CountrySchema = createSelectSchema(countries)
export type CountryType = z.infer<typeof CountrySchema> 