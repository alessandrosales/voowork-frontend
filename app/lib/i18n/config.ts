import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./locales/en"
import ptBr from "./locales/pt_br"
import es from "./locales/es"

export const defaultNS = "translation"
export const resources = {
  en: { translation: en },
  pt_br: { translation: ptBr },
  es: { translation: es },
} as const

export type Locale = keyof typeof resources
export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt_br", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
]

i18n.use(initReactI18next).init({
  resources,
  lng: "pt_br",
  fallbackLng: "en",
  defaultNS,
  interpolation: { escapeValue: false },
})

export default i18n
