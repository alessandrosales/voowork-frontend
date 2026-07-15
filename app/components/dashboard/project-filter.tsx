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
}

const DEFAULT_PROJECTS: ProjectOption[] = [
  { value: "all", label: "Todos os projetos" },
  { value: "projeto-alpha", label: "Projeto Alpha" },
  { value: "projeto-beta", label: "Projeto Beta" },
  { value: "projeto-gamma", label: "Projeto Gamma" },
  { value: "projeto-delta", label: "Projeto Delta" },
]

export function ProjectFilter({
  value = "all",
  onChange,
  projects = DEFAULT_PROJECTS,
}: ProjectFilterProps) {
  return (
    <Select value={value} onValueChange={onChange ?? (() => {})}>
      <SelectTrigger className="w-full !h-8">
        <SelectValue placeholder="Todos os projetos" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.value} value={project.value}>
            {project.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
