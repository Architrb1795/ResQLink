import en from '../locales/en.json';
import mr from '../locales/mr.json';
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';

export const translations = { en, mr, hi, gu };

export const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

export function getTranslation(lang, key) {
  const keys = key.split('.');
  let value = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}