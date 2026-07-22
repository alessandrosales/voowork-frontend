"use client"

import { useState } from "react"
import { CopyIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { Screenshot } from "~/lib/api/types"
import { ActivityLevelBadge } from "~/components/screenshots/activity-level-badge"
import { ScreenshotDialog } from "~/components/screenshots/screenshot-dialog"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getInitial(name: string | null): string {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface ScreenshotsCardProps {
  screenshots: Screenshot[]
  isLoading: boolean
  error: string | null
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function ScreenshotsCard({
  screenshots,
  isLoading,
  error,
}: ScreenshotsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogIndex, setDialogIndex] = useState<number | null>(null)

  function handleCardClick(index: number) {
    setDialogIndex(index)
    setDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Screenshots</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : screenshots.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Nenhum screenshot encontrado.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {screenshots.map((screenshot, i) => (
                <button
                  key={screenshot.id}
                  type="button"
                  onClick={() => handleCardClick(i)}
                  className="flex w-44 shrink-0 flex-col gap-2 rounded-lg border bg-gradient-to-b p-2 text-left transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
                    {screenshot.signed_url ? (
                      <img
                        src={screenshot.signed_url}
                        alt={`Screenshot - ${screenshot.user_name ?? "desconhecido"}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-background/80 text-sm font-medium text-foreground shadow-xs">
                        {getInitial(screenshot.user_name)}
                      </div>
                    )}
                  </div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {screenshot.is_duplicate && (
                      <Badge variant="secondary" className="gap-0.5 text-[10px]">
                        <CopyIcon className="size-2.5" />
                        Repetitiva
                      </Badge>
                    )}
                    {screenshot.activity_level && (
                      <ActivityLevelBadge level={screenshot.activity_level} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">
                      {screenshot.user_name || "—"}
                    </span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {formatTimestamp(screenshot.captured_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
