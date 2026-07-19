"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

export interface ProjectOption {
  value: string
  label: string
}

interface ProjectFilterProps {
  value?: string
  onChange?: (value: string) => void
  projects?: ProjectOption[]
  loading?: boolean
}

const ALL_OPTION: ProjectOption = { value: "all", label: "Todos os projetos" }

export function ProjectFilter({
  value = "all",
  onChange,
  projects,
  loading = false,
}: ProjectFilterProps) {
  const options = projects ? [ALL_OPTION, ...projects] : [ALL_OPTION]

  return (
    <Select
      value={value}
      onValueChange={onChange ?? (() => {})}
      disabled={loading}
    >
      <SelectTrigger className="w-full !h-8">
        <SelectValue placeholder="Todos os projetos" />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="all" disabled>
            Carregando...
          </SelectItem>
        ) : (
          options.map((project) => (
            <SelectItem key={project.value} value={project.value}>
              {project.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
