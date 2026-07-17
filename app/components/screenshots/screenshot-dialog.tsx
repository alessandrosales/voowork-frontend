"use client"

import { useEffect, useCallback, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, MaximizeIcon, MinimizeIcon, MonitorIcon, XIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog"
import type { Screenshot } from "~/lib/api/types"

/* ------------------------------------------------------------------ */
/*  Labels para eventos de periférico                                 */
/* ------------------------------------------------------------------ */

const PERIPHERAL_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  mouse_activity: {
    label: "Mouse",
    icon: <MonitorIcon className="size-3" />,
  },
  keyboard_activity: {
    label: "Teclado",
    icon: <MonitorIcon className="size-3" />,
  },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitial(name: string | null): string {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Info Row                                                          */
/* ------------------------------------------------------------------ */

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="text-muted-foreground">{label}:</span>
      <span className="truncate font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ScreenshotDialog                                                  */
/* ------------------------------------------------------------------ */

interface ScreenshotDialogProps {
  screenshots: Screenshot[]
  currentIndex: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onIndexChange: (index: number) => void
}

export function ScreenshotDialog({
  screenshots,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ScreenshotDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const hasPrev = currentIndex !== null && currentIndex > 0
  const hasNext = currentIndex !== null && currentIndex < screenshots.length - 1
  const screenshot =
    currentIndex !== null ? screenshots[currentIndex] : null

  /* ---- Reset fullscreen on dialog close ---- */
  useEffect(() => {
    if (!open) {
      setIsFullscreen(false)
    }
  }, [open])

  /* ---- Keyboard navigation ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || currentIndex === null) return

      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault()
        onIndexChange(currentIndex - 1)
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault()
        onIndexChange(currentIndex + 1)
      }
    },
    [open, currentIndex, hasPrev, hasNext, onIndexChange],
  )

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!screenshot) return null

  const peripheralEntries = Object.entries(screenshot.peripheral_events)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isFullscreen
            ? "flex h-dvh w-screen max-h-dvh max-w-full flex-col gap-0 overflow-hidden p-0 rounded-none sm:max-w-full"
            : "flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        }
        showCloseButton={false}
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <DialogTitle className="text-sm font-medium">
            Screenshot{" "}
            {currentIndex !== null && (
              <span className="text-muted-foreground">
                {currentIndex + 1} / {screenshots.length}
              </span>
            )}
          </DialogTitle>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[11px] text-muted-foreground hidden sm:inline">
              ← → navegar
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasPrev}
              onClick={() => hasPrev && onIndexChange(currentIndex! - 1)}
              aria-label="Anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasNext}
              onClick={() => hasNext && onIndexChange(currentIndex! + 1)}
              aria-label="Próximo"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsFullscreen((v) => !v)}
              aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <MinimizeIcon className="size-4" />
              ) : (
                <MaximizeIcon className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* ---- Body: image + details ---- */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:flex-row">
          {/* Image */}
          <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-lg bg-muted md:min-h-0">
            {screenshot.signed_url ? (
              <img
                src={screenshot.signed_url}
                alt={`Screenshot - ${screenshot.user_name ?? "desconhecido"} - ${screenshot.captured_at}`}
                className="h-full w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-background/80 text-2xl font-medium text-foreground shadow-xs">
                {getInitial(screenshot.user_name)}
              </div>
            )}
          </div>

          {/* Details panel */}
          <div className="flex w-full shrink-0 flex-col gap-4 md:w-64">
            {/* User */}
            <div className="rounded-lg border p-3">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Usuário
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {getInitial(screenshot.user_name)}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {screenshot.user_name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="rounded-lg border p-3">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Capturado em
              </h4>
              <p className="text-sm font-medium">
                {formatTimestamp(screenshot.captured_at)}
              </p>
            </div>

            {/* Project & Task */}
            <div className="rounded-lg border p-3">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Projeto
              </h4>
              <InfoRow label="Projeto" value={screenshot.project_name} />
              <InfoRow label="Tarefa" value={screenshot.task_name} />
            </div>

            {/* Peripheral events */}
            <div className="rounded-lg border p-3">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Atividade
              </h4>
              {peripheralEntries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {peripheralEntries.map(([type, count]) => {
                    const meta = PERIPHERAL_LABELS[type]
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                      >
                        {meta?.icon}
                        {meta?.label || type}: {count}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhum evento registrado.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
