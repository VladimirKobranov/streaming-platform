import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import ja from "./locales/ja.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ko from "./locales/ko.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      ja: { translation: ja },
      es: { translation: es },
      zh: { translation: zh },
      fr: { translation: fr },
      de: { translation: de },
      pt: { translation: pt },
      ko: { translation: ko },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
