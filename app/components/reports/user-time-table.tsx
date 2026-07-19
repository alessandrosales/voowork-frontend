"use client"

import { ChevronRightIcon, UserIcon } from "lucide-react"

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
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import type { UserTimeUser, UserTimeEntry } from "~/lib/api/types"

/* ---------- Helpers ---------- */

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return "< 1m"
}

/* ---------- Entry Rows (inside a user group) ---------- */

function EntryRows({ entries }: { entries: UserTimeEntry[] }) {
  return (
    <div className="pl-12">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="py-1 text-xs">Projeto</TableHead>
            <TableHead className="py-1 text-xs">Tarefa</TableHead>
            <TableHead className="py-1 text-right text-xs">Tempo</TableHead>
            <TableHead className="py-1 text-right text-xs">Trackings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={`${entry.project_id}|${entry.task_id}`}>
              <TableCell className="py-1.5 text-sm">
                {entry.project_name}
              </TableCell>
              <TableCell className="py-1.5 text-sm text-muted-foreground">
                {entry.task_name}
              </TableCell>
              <TableCell className="py-1.5 text-right tabular-nums text-sm">
                {formatDuration(entry.total_seconds)}
              </TableCell>
              <TableCell className="py-1.5 text-right tabular-nums text-sm text-muted-foreground">
                {entry.trackings_count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ---------- User Group ---------- */

function UserGroup({ user }: { user: UserTimeUser }) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left hover:bg-muted/50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{user.user_initials}</AvatarFallback>
        </Avatar>
        <span className="flex-1 font-medium">{user.user_name}</span>
        <span className="tabular-nums text-sm text-muted-foreground">
          {formatDuration(user.total_seconds)}
        </span>
        <span className="text-xs text-muted-foreground">
          {user.entries_count} {user.entries_count === 1 ? "entrada" : "entradas"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-b-lg border border-t-0">
        <div className="py-2">
          <EntryRows entries={user.entries} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/* ---------- Props ---------- */

interface UserTimeTableProps {
  data: UserTimeUser[]
  isLoading: boolean
  error?: string | null
}

/* ---------- Component ---------- */

export function UserTimeTable({
  data,
  isLoading,
  error,
}: UserTimeTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo por Usuário</CardTitle>
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
          <CardTitle>Tempo por Usuário</CardTitle>
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
          <CardTitle>Tempo por Usuário</CardTitle>
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
        <CardTitle>Tempo por Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {data.map((user) => (
            <UserGroup key={user.user_id} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
