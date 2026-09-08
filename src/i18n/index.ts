import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import type { AppLanguage } from "@/types";

const LANGUAGE_KEY = "orderflow_language";

export const languages: Array<{ code: AppLanguage; native: string }> = [
  { code: "en", native: "English" },
  { code: "de", native: "Deutsch" },
  { code: "es", native: "Español" },
  { code: "fr", native: "Français" },
  { code: "it", native: "Italiano" },
];

export function readSavedLanguage(): AppLanguage {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved === "en" || saved === "de" || saved === "es" || saved === "fr" || saved === "it") {
    return saved;
  }
  return "en";
}

export function persistLanguage(code: AppLanguage): void {
  localStorage.setItem(LANGUAGE_KEY, code);
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    it: { translation: it },
  },
  lng: typeof localStorage === "undefined" ? "en" : readSavedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
