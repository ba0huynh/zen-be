
export const LanguageCodes = {
  EN: "en",
  VI: "vi",
} as const;
export type LanguageCode =
  (typeof LanguageCodes)[keyof typeof LanguageCodes];

  
export const Genders = {
  MALE: "male",
  FEMALE: "female",
} as const;
export type Gender =
  (typeof Genders)[keyof typeof Genders];
