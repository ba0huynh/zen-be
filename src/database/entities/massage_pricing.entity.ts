import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { gen_random_uuid } from "../database.constant";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const MassagePricing = pgTable('massage_pricing', {
    id: text('id').primaryKey().default(gen_random_uuid),
    massageId: text('massage_id').notNull(),
    price: numeric('price',{mode:'number'}).notNull(),
    duration: numeric('duration',{mode:'number'}).notNull(),
})


export const MassagePricingSchema = createSelectSchema(MassagePricing)
export type MassagePricingType = z.infer<typeof MassagePricingSchema> 

