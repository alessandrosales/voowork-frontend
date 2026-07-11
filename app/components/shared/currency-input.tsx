"use client"

import * as React from "react"

import { Input } from "~/components/ui/input"

/* ---------- Locale config ---------- */

const CURRENCY_LOCALE = "pt-BR"
const CURRENCY_CODE = "BRL"

function formatCurrency(value: string): string {
  const num = parseFloat(value)
  if (isNaN(num)) return ""
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
  }).format(num)
}

/* ---------- Helpers ---------- */

/**
 * Converte rawDigits (ex: "123456") para display pt-BR (ex: "1.234,56")
 * Os últimos 2 dígitos SEMPRE representam os centavos.
 */
function formatCents(digits: string): string {
  if (!digits) return ""

  // Garante no mínimo 3 dígitos para ter parte inteira + 2 centavos
  const padded = digits.padStart(3, "0")
  const intPart = padded.slice(0, -2) // tudo exceto os 2 últimos
  const decPart = padded.slice(-2)    // 2 últimos = centavos

  // Remove zeros à esquerda da parte inteira
  const intClean = String(parseInt(intPart, 10))

  // Aplica separador de milhar
  const formattedInt = intClean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return `${formattedInt},${decPart}`
}

/** Converte rawDigits para o valor raw do form (ex: "123456" → "1234.56") */
function digitsToRaw(digits: string): string {
  if (!digits) return ""
  const padded = digits.padStart(3, "0")
  const intPart = padded.slice(0, -2)
  const decPart = padded.slice(-2)
  const intClean = String(parseInt(intPart, 10))
  return `${intClean}.${decPart}`
}

/** Extrai rawDigits de um valor raw do form (ex: "1234.56" → "123456") */
function rawToDigits(raw: string): string {
  return raw.replace(/\D/g, "")
}

/* ---------- Types ---------- */

interface CurrencyInputProps {
  /** Raw number string — ex: "1234.56" */
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  id?: string
  ariaInvalid?: boolean
}

/* ---------- Component ---------- */

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  placeholder = "0,00",
  disabled = false,
  id,
  ariaInvalid,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  // rawDigits = string com APENAS dígitos (ex: "123456")
  // Os últimos 2 dígitos são sempre os centavos
  const [rawDigits, setRawDigits] = React.useState(() => rawToDigits(value))

  const inputRef = React.useRef<HTMLInputElement>(null)
  const isInternalUpdate = React.useRef(false)

  // Sincroniza rawDigits quando o value externo muda (ex: populate do form)
  React.useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    setRawDigits(rawToDigits(value))
  }, [value])

  // Valor para exibição no input
  const displayValue = React.useMemo(() => {
    if (isFocused) {
      // Focado: mostra o número formatado sem o símbolo R$
      return formatCents(rawDigits)
    }
    // Blur: mostra valor completo com R$
    return rawDigits ? formatCurrency(digitsToRaw(rawDigits)) : ""
  }, [isFocused, rawDigits])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    requestAnimationFrame(() => {
      e.target.select()
    })
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extrai apenas dígitos do que o usuário digitou
    const digits = e.target.value.replace(/\D/g, "")

    setRawDigits(digits)

    // Converte para o valor raw do form
    const raw = digitsToRaw(digits)
    isInternalUpdate.current = true
    onChange(raw)

    // Move cursor para o fim após renderização
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = inputRef.current.value.length
        inputRef.current.setSelectionRange(pos, pos)
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
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      className="tabular-nums"
    />
  )
}
