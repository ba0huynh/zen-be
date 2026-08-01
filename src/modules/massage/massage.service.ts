import { and, asc, eq } from "drizzle-orm";
import { massages, massageTranslations } from "../../database/database.schema";
import db from "../../database/drizzle";
import { LanguageCode } from "../../database/database.type";
import { extractTableColumns } from "../../helpers/extractColumns";
import { MassagePricing } from "../../database/entities/massage_pricing.entity";
import { jsonAgg } from "../../helpers/sql.helper";

async function getMassages(langageCode: LanguageCode) {
    const pricingQuery = db.select({ massageId: MassagePricing.massageId, 
        data: jsonAgg({ ...extractTableColumns(MassagePricing, ['price', 'duration']) }).as('pricing') })
        .from(MassagePricing)
        .groupBy(MassagePricing.massageId).as('pricingQuery')

    return await db.select({
        ...extractTableColumns(massages, ['id','image']),
        ...extractTableColumns(massageTranslations, ['name', 'description']),
        pricing: pricingQuery.data,
    })
        .from(massages)
        .innerJoin(pricingQuery, eq(massages.id, pricingQuery.massageId))
        .innerJoin(massageTranslations,
            and(
                eq(massages.id, massageTranslations.massageId),
                eq(massageTranslations.languageCode, langageCode)))
        .orderBy(asc(massages.order));
}
const MassageService = {
    getMassages
} as const
export default MassageService
