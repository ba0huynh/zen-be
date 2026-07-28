
export const LanguageCodes = {
  EN: "en",
  VI: "vi",
} as const;
export type LanguageCode =
  (typeof LanguageCodes)[keyof typeof LanguageCodes];
