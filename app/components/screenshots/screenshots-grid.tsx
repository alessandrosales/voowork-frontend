"use client"

import { useState } from "react"

import {
  Card,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import type { Screenshot } from "~/lib/api/types"
import { ScreenshotDialog } from "./screenshot-dialog"

/* ------------------------------------------------------------------ */
/*  Tipos internos para o grid agrupado por hora                      */
/* ------------------------------------------------------------------ */

export interface HourGroup {
  hour: number
  label: string
  screenshots: Screenshot[]
}

/* ------------------------------------------------------------------ */
/*  Agrupamento por hora                                              */
/* ------------------------------------------------------------------ */

function groupByHour(screenshots: Screenshot[]): HourGroup[] {
  const groups = new Map<number, HourGroup>()

  for (const s of screenshots) {
    const date = new Date(s.captured_at)
    const hour = date.getHours()

    if (!groups.has(hour)) {
      groups.set(hour, {
        hour,
        label: `${String(hour).padStart(2, "0")}:00 — ${String(hour).padStart(2, "0")}:59`,
        screenshots: [],
      })
    }

    groups.get(hour)!.screenshots.push(s)
  }

  return Array.from(groups.values()).sort((a, b) => b.hour - a.hour)
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
          <div key={group.hour}>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label}
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
                      <CardHeader className="px-2.5 py-2">
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
