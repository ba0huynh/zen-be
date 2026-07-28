import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { LanguageCode } from "../database.type";
import { massages } from "./massage.entity";

export const massageTranslations = pgTable("massage_translations", {
    massageId: text("massage_id").notNull().references(() => massages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text("name").notNull(),
    languageCode: text("language_code").$type<LanguageCode>().notNull(),
    description: text("description").notNull(),
}, (table) => [primaryKey({ columns: [table.massageId, table.languageCode] })])