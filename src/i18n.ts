import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { id } from "./constant/locales/id";
import { ms } from "./constant/locales/ms";
import { zh } from "./constant/locales/zh";
import { ta } from "./constant/locales/ta";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            id: { translation: id },
            ms: { translation: ms },
            zh: { translation: zh },
            ta: { translation: ta },
        },
        fallbackLng: "id",
        load: "languageOnly", // only load 'id' instead of 'id-ID'
        debug: true,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: "app_lang", // maintain compatibility with previous localStorage key if possible, or just let it use i18next-lng
            caches: ["localStorage"],
        },
    });

export default i18n;
