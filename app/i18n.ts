import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import es from '../locales/es/translation.json';
import { Language, StorageKey } from '@/@types/language';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

AsyncStorage.getItem(StorageKey.language).then(lng => {
  i18n.use(initReactI18next).init({
    resources,
    compatibilityJSON: 'v3',
    fallbackLng: Language.en,
    debug: false,
    lng: lng || Language.en,
    interpolation: {
      escapeValue: false,
    },
  });
});

export default i18n;
