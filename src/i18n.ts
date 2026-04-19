import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string) => {
      // Dynamic import locale files based on language name
      switch (language) {
        case "id":
          return import("./constant/locales/id").then((m) => m.id);
        case "en":
          return import("./constant/locales/en").then((m) => m.en);
        case "ms":
          return import("./constant/locales/ms").then((m) => m.ms);
        case "zh":
          return import("./constant/locales/zh").then((m) => m.zh);
        case "ta":
          return import("./constant/locales/ta").then((m) => m.ta);
        case "ar":
          return import("./constant/locales/ar").then((m) => m.ar);
        default:
          return import("./constant/locales/id").then((m) => m.id);
      }
    }),
  )
  .use(initReactI18next)
  .init({
    fallbackLng: "id",
    load: "languageOnly",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "app_lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
