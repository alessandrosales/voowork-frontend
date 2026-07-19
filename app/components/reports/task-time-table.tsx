"use client"

import { ChevronRightIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { TaskTimeProject, TaskTimeTask } from "~/lib/api/types"

/* ---------- Helpers ---------- */

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return "< 1m"
}

/* ---------- Task Rows (inside a project group) ---------- */

function TaskRows({ tasks }: { tasks: TaskTimeTask[] }) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[50%] py-1 text-xs">Task</TableHead>
          <TableHead className="w-[30%] py-1 text-right text-xs">Tempo</TableHead>
          <TableHead className="w-[20%] py-1 text-right text-xs">Trackings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.task_id}>
            <TableCell className="py-1.5 text-sm truncate">
              {task.task_name}
            </TableCell>
            <TableCell className="py-1.5 text-right tabular-nums text-sm">
              {formatDuration(task.total_seconds)}
            </TableCell>
            <TableCell className="py-1.5 text-right tabular-nums text-sm text-muted-foreground">
              {task.trackings_count}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ---------- Project Group ---------- */

function ProjectGroup({ project }: { project: TaskTimeProject }) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
        <span className="w-[50%] font-medium truncate">{project.project_name}</span>
        <span className="w-[30%] text-right tabular-nums text-sm text-muted-foreground">
          {formatDuration(project.total_seconds)}
        </span>
        <span className="w-[20%] text-right text-xs text-muted-foreground">
          {project.tasks_count} {project.tasks_count === 1 ? "task" : "tasks"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-b-lg border border-t-0">
        <div className="py-2 pl-8">
          <TaskRows tasks={project.tasks} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- Props ---------- */

interface TaskTimeTableProps {
  data: TaskTimeProject[]
  isLoading: boolean
  error?: string | null
}

/* ---------- Component ---------- */

export function TaskTimeTable({
  data,
  isLoading,
  error,
}: TaskTimeTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo por Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-sm">Carregando relatório...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo por Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo por Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Nenhum registro encontrado para o período selecionado.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo por Tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.map((project) => (
            <ProjectGroup key={project.project_id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
