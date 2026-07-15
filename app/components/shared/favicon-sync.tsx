"use client"

import { useCallback, useEffect } from "react"
import { useTheme } from "~/components/shared/theme-provider"

function applyFavicon(href: string) {
  const existing = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  existing.forEach((el) => el.remove())

  const link = document.createElement("link")
  link.rel = "icon"
  link.href = href
  document.head.appendChild(link)
}

export function FaviconSync() {
  const { theme } = useTheme()

  const update = useCallback(() => {
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme

    const href =
      resolved === "dark" ? "/favicon-dark.ico" : "/favicon-light.ico"

    applyFavicon(href)
  }, [theme])

  useEffect(() => {
    update()
  }, [update])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (theme === "system") {
        applyFavicon(
          mq.matches ? "/favicon-dark.ico" : "/favicon-light.ico",
        )
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  return null
}
