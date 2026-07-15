"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export interface PeriodOption {
  value: string
  label: string
}

interface PeriodFilterProps {
  value?: string
  onChange?: (value: string) => void
  periods?: PeriodOption[]
}

const DEFAULT_PERIODS: PeriodOption[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Essa semana" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Outro Período" },
]

export function PeriodFilter({
  value = "today",
  onChange,
  periods = DEFAULT_PERIODS,
}: PeriodFilterProps) {
  return (
    <Select value={value} onValueChange={onChange ?? (() => {})}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione o período" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
