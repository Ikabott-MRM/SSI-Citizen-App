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

enum LangCode {
  en = 'en',
  es = 'es',
}

// const initI18n = async () => {
//   let savedLanguage = await AsyncStorage.getItem(StorageKey.language);

//   if (!savedLanguage) {
//     savedLanguage = Language.en;
//   }

//   i18n.use(initReactI18next).init({
//     compatibilityJSON: 'v3',
//     resources,
//     lng: savedLanguage,
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false,
//     },
//   });
// };

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

// export default (async () => {
//   await initI18n();
//   return i18n;
// })();
