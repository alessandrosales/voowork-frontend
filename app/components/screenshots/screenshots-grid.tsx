"use client"

import { useState } from "react"
import { CopyIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import type { Screenshot } from "~/lib/api/types"
import { ScreenshotDialog } from "./screenshot-dialog"

/* ------------------------------------------------------------------ */
/*  Tipos internos para o grid agrupado por dia + hora                */
/* ------------------------------------------------------------------ */

export interface HourGroup {
  key: string
  date: string
  hour: number
  label: string
  screenshots: Screenshot[]
}

/* ------------------------------------------------------------------ */
/*  Helpers de data                                                   */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function dateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/* ------------------------------------------------------------------ */
/*  Agrupamento por dia + hora                                        */
/* ------------------------------------------------------------------ */

function groupByHour(screenshots: Screenshot[]): HourGroup[] {
  const groups = new Map<string, HourGroup>()

  for (const s of screenshots) {
    const date = new Date(s.captured_at)
    const hour = date.getHours()
    const dayKey = dateKey(s.captured_at)
    const key = `${dayKey}-${hour}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        date: formatDate(s.captured_at),
        hour,
        label: `${String(hour).padStart(2, "0")}:00 — ${String(hour).padStart(2, "0")}:59`,
        screenshots: [],
      })
    }

    groups.get(key)!.screenshots.push(s)
  }

  return Array.from(groups.values()).sort((a, b) => {
    // Sort by date descending, then by hour descending
    const dateCmp = b.key.localeCompare(a.key)
    if (dateCmp !== 0) return dateCmp
    return b.hour - a.hour
  })
}

/* ------------------------------------------------------------------ */
/*  Componentes                                                       */
/* ------------------------------------------------------------------ */

function getInitial(name: string | null): string {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function ScreenshotThumbnail({
  signed_url,
  user_name,
  captured_at,
}: {
  signed_url: string
  user_name: string | null
  captured_at: string
}) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-md bg-muted">
      {signed_url ? (
        <img
          src={signed_url}
          alt={`Screenshot - ${user_name ?? "desconhecido"} - ${captured_at}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-full bg-background/80 text-xs font-medium text-foreground shadow-xs">
          {getInitial(user_name)}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface ScreenshotsGridProps {
  screenshots?: Screenshot[]
  isLoading?: boolean
  error?: string | null
}

export function ScreenshotsGrid({
  screenshots,
  isLoading,
  error,
}: ScreenshotsGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogIndex, setDialogIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando screenshots...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Nenhum screenshot encontrado.
      </div>
    )
  }

  const groups = groupByHour(screenshots)

  function handleCardClick(index: number) {
    setDialogIndex(index)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.key}>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              <span className="tabular-nums">{group.date}</span>
              <span className="mx-1.5">•</span>
              <span>{group.label}</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {group.screenshots.map((screenshot) => {
                // Find the global index in the flat screenshots array
                const globalIndex = screenshots.indexOf(screenshot)
                return (
                  <button
                    key={screenshot.id}
                    type="button"
                    onClick={() => handleCardClick(globalIndex)}
                    className="block text-left cursor-pointer"
                  >
                    <Card
                      size="sm"
                      className="overflow-hidden pt-0 pb-0 gap-0 transition-shadow hover:shadow-md"
                    >
                      <ScreenshotThumbnail
                        signed_url={screenshot.signed_url}
                        user_name={screenshot.user_name}
                        captured_at={screenshot.captured_at}
                      />
                      <CardHeader className="gap-1.5 px-2.5 py-2">
                        <div className="flex flex-wrap gap-1">
                          {screenshot.is_duplicate && (
                            <Badge variant="secondary" className="gap-0.5 text-[10px]">
                              <CopyIcon className="size-2.5" />
                              Repetitiva
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <CardTitle className="truncate text-xs font-medium">
                            {screenshot.user_name}
                          </CardTitle>
                          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {formatTimestamp(screenshot.captured_at)}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <ScreenshotDialog
        screenshots={screenshots}
        currentIndex={dialogIndex}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onIndexChange={setDialogIndex}
      />
    </>
  )
}
