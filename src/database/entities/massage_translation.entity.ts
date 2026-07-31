import { pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { LanguageCode, LanguageCodes } from "../database.type";
import { massages } from "./massage.entity";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const massageTranslations = pgTable("massage_translations", {
    massageId: text("massage_id").notNull().references(() => massages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text("name").notNull(),
    languageCode: text("language_code").$type<LanguageCode>().notNull(),
    description: text("description").notNull(),
}, (table) => [primaryKey({ columns: [table.massageId, table.languageCode] })])

export const MassageTranslationSchema = createSelectSchema(massageTranslations,{
    languageCode:z.enum(LanguageCodes)
})
export type MassageTranslationType = z.infer<typeof MassageTranslationSchema> 