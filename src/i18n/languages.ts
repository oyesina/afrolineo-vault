/**
 * Supported display languages and how one is chosen for a visitor.
 * English is the default and always available.
 */

export const LANGUAGES = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];
export const DEFAULT_LANG: Lang = 'en';

export const isLang = (v: unknown): v is Lang => LANGUAGES.some((l) => l.code === v);

/**
 * European countries whose main language we support (ISO 3166 codes).
 * Countries with several official languages (Belgium, Switzerland,
 * Luxembourg) are left out on purpose: the browser language decides there.
 */
export const COUNTRY_LANGUAGE: Record<string, Lang> = {
  FR: 'fr', MC: 'fr',
  DE: 'de', AT: 'de', LI: 'de',
  ES: 'es', AD: 'es',
  IT: 'it', SM: 'it', VA: 'it',
  PT: 'pt',
  NL: 'nl',
};

/** Countries where the browser language should decide (several official languages). */
export const MULTILINGUAL_COUNTRIES = new Set(['BE', 'CH', 'LU']);

export type LangSource = 'manual' | 'browser' | 'country' | 'default';

/**
 * Pick the display language. Order:
 *  1. a language the person chose before (or ?lang= in the address)
 *  2. the first browser language we support, English included
 *  3. the main language of their country
 *  4. English
 */
export function pickLanguage({
  saved,
  browserLanguages,
  country,
}: {
  saved?: string | null;
  browserLanguages: readonly string[];
  country?: string | null;
}): { lang: Lang; source: LangSource } {
  if (isLang(saved)) return { lang: saved, source: 'manual' };

  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return { lang: base, source: 'browser' };
  }

  const fromCountry = country ? COUNTRY_LANGUAGE[country.toUpperCase()] : undefined;
  if (fromCountry) return { lang: fromCountry, source: 'country' };

  return { lang: DEFAULT_LANG, source: 'default' };
}

/** True when the browser languages alone can't settle it, so asking for the country helps. */
export function needsCountry(browserLanguages: readonly string[]): boolean {
  return !browserLanguages.some((tag) => isLang(tag.toLowerCase().split('-')[0]));
}
