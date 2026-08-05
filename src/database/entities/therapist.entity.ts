import { pgTable, text } from "drizzle-orm/pg-core";

export const therapists = pgTable("therapists", {
    email: text("email").notNull().primaryKey(),
    name: text("name").notNull(),
})