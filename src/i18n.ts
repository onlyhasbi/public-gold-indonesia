import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

// Eagerly pre-load ID locale to prevent React Suspense waterfall on initial mount
import { id } from "./constant/locales/id";

i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string) => {
      // Dynamic import locale files based on language name for non-default languages
      if (language === "id") return Promise.resolve(id);
      switch (language) {
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
          return Promise.resolve(id);
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
    // Populate cache with eager loaded locales immediately
    resources: {
      id: { translation: id },
    },
    partialBundledLanguages: true,
  });

export default i18n;
