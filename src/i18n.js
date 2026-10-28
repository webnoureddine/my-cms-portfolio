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

// Project purpose — who/what the project was built for.
// Keys must match the CHECK constraint in migration_4_purpose_reviews.sql.
export const PURPOSES = [
  { id: 'client',      en: 'Client project',   fr: 'Projet client',     ar: 'مشروع لعميل' },
  { id: 'education',   en: 'Academic',         fr: 'Académique',        ar: 'مشروع تعليمي' },
  { id: 'personal',    en: 'Personal project', fr: 'Projet personnel',  ar: 'مشروع شخصي' },
  { id: 'open_source', en: 'Open source',      fr: 'Open source',       ar: 'مفتوح المصدر' },
  { id: 'other',       en: 'Other',            fr: 'Autre',             ar: 'أخرى' },
];

export function purposeLabel(language, id) {
  const p = PURPOSES.find((x) => x.id === id);
  if (!p) return null;
  return t(language, p.en, p.fr, p.ar);
}

// Label for the "detail" line that goes with a purpose (client name, school…)
export function purposeDetailLabel(language, id) {
  switch (id) {
    case 'client':    return t(language, 'Client', 'Client', 'العميل');
    case 'education': return t(language, 'Institution / course', 'Établissement / cours', 'المؤسسة / المقرر');
    default:          return t(language, 'Context', 'Contexte', 'السياق');
  }
}
