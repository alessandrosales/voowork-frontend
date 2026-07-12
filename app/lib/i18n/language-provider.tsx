"use client"

import { useEffect, type ReactNode } from "react"
import { useAuth } from "~/hooks/use-auth"
import i18n from "./config"

const LOCALE_HTML_LANG: Record<string, string> = {
  en: "en",
  pt_br: "pt-BR",
  es: "es",
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    const lang = user?.preferred_language ?? "pt_br"

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang)
    }

    document.documentElement.lang = LOCALE_HTML_LANG[lang] ?? "pt-BR"
  }, [user, isLoading])

  return <>{children}</>
}
