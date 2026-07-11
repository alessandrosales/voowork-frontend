"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

/* ---------- Types ---------- */

interface DatePickerInputProps {
  /** Date string in "YYYY-MM-DD" format */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  ariaInvalid?: boolean
}

/* ---------- Component ---------- */

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  id,
  ariaInvalid,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)

  // Converte string "YYYY-MM-DD" → Date para o Calendar
  const date = React.useMemo(() => {
    if (!value) return undefined
    const parsed = parse(value, "yyyy-MM-dd", new Date())
    return isValid(parsed) ? parsed : undefined
  }, [value])

  // Quando seleciona uma data no calendário
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(format(selectedDate, "yyyy-MM-dd"))
    }
    setOpen(false)
  }

  // Quando digita manualmente no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type="date"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className="[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full aspect-square text-muted-foreground hover:text-foreground"
            disabled={disabled}
            aria-label="Abrir calendário"
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
