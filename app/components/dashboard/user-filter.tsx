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
  loading?: boolean
}

const ALL_OPTION: UserOption = { value: "all", label: "Todos os usuários" }

export function UserFilter({
  value = "all",
  onChange,
  users,
  loading = false,
}: UserFilterProps) {
  const options = users ? [ALL_OPTION, ...users] : [ALL_OPTION]

  return (
    <Select
      value={value}
      onValueChange={onChange ?? (() => {})}
      disabled={loading}
    >
      <SelectTrigger className="w-full !h-8">
        <SelectValue placeholder="Todos os usuários" />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="all" disabled>
            Carregando...
          </SelectItem>
        ) : (
          options.map((user) => (
            <SelectItem key={user.value} value={user.value}>
              {user.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
