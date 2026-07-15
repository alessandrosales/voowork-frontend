"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export interface UserOption {
  value: string
  label: string
}

interface UserFilterProps {
  value?: string
  onChange?: (value: string) => void
  users?: UserOption[]
}

const DEFAULT_USERS: UserOption[] = [
  { value: "all", label: "Todos os usuários" },
  { value: "ana-silva", label: "Ana Silva" },
  { value: "carlos-oliveira", label: "Carlos Oliveira" },
  { value: "marina-costa", label: "Marina Costa" },
  { value: "rafael-santos", label: "Rafael Santos" },
  { value: "juliana-lima", label: "Juliana Lima" },
]

export function UserFilter({
  value = "all",
  onChange,
  users = DEFAULT_USERS,
}: UserFilterProps) {
  return (
    <Select value={value} onValueChange={onChange ?? (() => {})}>
      <SelectTrigger className="w-full !h-8">
        <SelectValue placeholder="Todos os usuários" />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.value} value={user.value}>
            {user.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
