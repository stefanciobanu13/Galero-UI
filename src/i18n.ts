import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ro from './locales/ro.json';

export type MessageSchema = typeof en;

const messages = {
  en,
  ro,
};

// Detect language from localStorage or browser
const getDefaultLanguage = (): string => {
  const saved = localStorage.getItem('galero_language');
  if (saved && (saved === 'en' || saved === 'ro')) {
    return saved;
  }
  
  // Try to detect browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'ro') {
    return 'ro';
  }
  
  return 'en';
};

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLanguage(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
} as any);

// Save language preference when changed
export const setLanguage = (lang: 'en' | 'ro') => {
  (i18n.global as any).locale.value = lang;
  localStorage.setItem('galero_language', lang);
};

export const getCurrentLanguage = (): 'en' | 'ro' => {
  return ((i18n.global as any).locale.value || 'en') as 'en' | 'ro';
};

export default i18n;
