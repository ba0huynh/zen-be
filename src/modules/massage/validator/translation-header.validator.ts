import z from "zod";
import { LanguageCodes } from "../../../database/database.type";

export const translationHeaderValidator = z.object({
    langageCode: z.enum(LanguageCodes).optional().default('en')
})