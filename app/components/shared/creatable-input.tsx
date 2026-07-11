"use client"

import * as React from "react"
import { CheckIcon, PlusIcon } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command"

/* ---------- Types ---------- */

export interface CreatableField {
  /** The displayed / typed text */
  name: string
  /** UUID when user selected from results, null if typed free text */
  selectedId: string | null
}

interface CreatableInputProps<T extends { id: string; name: string }> {
  value: CreatableField
  onChange: (field: CreatableField) => void
  /** Async function to search by name — with 300ms debounce */
  searchFn: (query: string) => Promise<T[]>
  placeholder?: string
  disabled?: boolean
  id?: string
  ariaInvalid?: boolean
  /** Quando fornecido, exibe um botão + para adicionar novo registro */
  onAdd?: () => void
}

/* ---------- Component ---------- */

export function CreatableInput<T extends { id: string; name: string }>({
  value,
  onChange,
  searchFn,
  placeholder,
  disabled = false,
  id,
  ariaInvalid,
  onAdd,
}: CreatableInputProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [results, setResults] = React.useState<T[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Debounce de 300ms antes de pesquisar no backend
  React.useEffect(() => {
    if (!value.name.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const items = await searchFn(value.name)
        setResults(items)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value.name, searchFn])

  // Fechar dropdown ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value, selectedId: null })
    setIsOpen(true)
  }

  const handleSelect = (item: T) => {
    onChange({ name: item.name, selectedId: item.id })
    setIsOpen(false)
  }

  const showDropdown = isOpen && value.name.trim().length > 0

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <Input
          id={id}
          value={value.name}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className="flex-1"
        />
        {onAdd && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            disabled={disabled}
            aria-label="Adicionar novo"
          >
            <PlusIcon className="size-4" />
          </Button>
        )}
      </div>
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
          <Command shouldFilter={false}>
            <CommandList>
              {isSearching ? (
                <CommandEmpty>Buscando...</CommandEmpty>
              ) : results.length === 0 ? (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              ) : null}
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleSelect(item)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        value.selectedId === item.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
