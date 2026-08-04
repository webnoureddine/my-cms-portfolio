// Tiny i18n helper — supports English, French and Arabic.
// t(language, en, fr, ar) picks the right string for the active language
// and gracefully falls back to English if a translation wasn't provided
// (useful for admin-entered content that may not have Arabic yet).

export function t(language, en, fr, ar) {
  if (language === 'ar') return ar ?? fr ?? en;
  if (language === 'fr') return fr ?? en;
  return en;
}

export const isRTL = (language) => language === 'ar';

export const LANGUAGES = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'ar', label: 'AR' },
];
