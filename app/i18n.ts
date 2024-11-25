import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import es from '../locales/es/translation.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

enum LangCode {
  en = 'en',
  es = 'es',
}

i18n.use(initReactI18next).init({
  debug: false,
  resources,
  lng: LangCode.es,
  fallbackLng: LangCode.es,
  compatibilityJSON: 'v3',
  interpolation: {
    escapeValue: false,
  },
});
