"use client"

import * as React from "react"

import { Input } from "~/components/ui/input"

export type CurrencyCode = "USD" | "BRL" | "EUR" | "GBP"

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCY_CONFIG
}

const CURRENCY_CONFIG: Record<CurrencyCode, { locale: string }> = {
  USD: { locale: "en-US" },
  BRL: { locale: "pt-BR" },
  EUR: { locale: "de-DE" },
  GBP: { locale: "en-GB" },
}

function getCurrencyConfig(currency: string): {
  code: CurrencyCode
  locale: string
} {
  if (isCurrencyCode(currency)) {
    const code = currency
    return { code, locale: CURRENCY_CONFIG[code].locale }
  }

  return { code: "USD", locale: CURRENCY_CONFIG.USD.locale }
}

function digitsToCents(digits: string): number | null {
  if (!digits) return null

  const cents = Number(digits)
  return Number.isSafeInteger(cents) ? cents : null
}

function centsToDigits(value: number | null): string {
  if (value === null || !Number.isSafeInteger(value) || value < 0) return ""
  return String(value)
}

function formatAmount(
  value: number,
  currency: string,
  withCurrency: boolean
): string {
  const { code, locale } = getCurrencyConfig(currency)

  return new Intl.NumberFormat(locale, {
    ...(withCurrency
      ? { style: "currency" as const, currency: code }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }).format(value / 100)
}

export interface CurrencyInputProps {
  /** Amount in the smallest currency unit (for example, 1234 = 12.34). */
  value: number | null
  onChange: (value: number | null) => void
  currency: CurrencyCode
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  id?: string
  ariaInvalid?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  onBlur,
  placeholder,
  disabled = false,
  id,
  ariaInvalid,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [rawDigits, setRawDigits] = React.useState(() => centsToDigits(value))
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setRawDigits(centsToDigits(value))
  }, [value])

  const displayValue = isFocused
    ? rawDigits
      ? formatAmount(Number(rawDigits), currency, false)
      : ""
    : rawDigits
      ? formatAmount(Number(rawDigits), currency, true)
      : ""

  const displayPlaceholder = placeholder ?? formatAmount(0, currency, false)

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    requestAnimationFrame(() => event.target.select())
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "")
    const nextValue = digitsToCents(digits)

    setRawDigits(digits)
    onChange(nextValue)

    requestAnimationFrame(() => {
      const input = inputRef.current
      if (input) {
        const position = input.value.length
        input.setSelectionRange(position, position)
      }
    })
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={() => {
        setIsFocused(false)
        onBlur?.()
      }}
      placeholder={displayPlaceholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className="tabular-nums"
    />
  )
}
