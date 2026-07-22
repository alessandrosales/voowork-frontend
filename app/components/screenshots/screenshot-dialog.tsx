"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, MaximizeIcon, MinimizeIcon, MonitorIcon, PlayIcon, PauseIcon, SearchIcon, XIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Given an <img> element with object-fit: contain, returns the actual
 * display dimensions of the image content and its offset within the element.
 */
function getImageDisplayRect(img: HTMLImageElement) {
  const elW = img.clientWidth
  const elH = img.clientHeight
  const natW = img.naturalWidth
  const natH = img.naturalHeight

  // Guard against missing natural dimensions
  if (!natW || !natH) {
    return { displayW: elW, displayH: elH, offsetX: 0, offsetY: 0 }
  }

  const elRatio = elW / elH
  const natRatio = natW / natH

  let displayW: number, displayH: number, offsetX: number, offsetY: number

  if (natRatio > elRatio) {
    // Image wider than element → letterbox top/bottom
    displayW = elW
    displayH = elW / natRatio
    offsetX = 0
    offsetY = (elH - displayH) / 2
  } else {
    // Image taller than element → letterbox left/right
    displayH = elH
    displayW = elH * natRatio
    offsetX = (elW - displayW) / 2
    offsetY = 0
  }

  return { displayW, displayH, offsetX, offsetY }
}

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

const LOOP_INTERVAL_MS = 3_000

export function ScreenshotDialog({
  screenshots,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: ScreenshotDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMagnifying, setIsMagnifying] = useState(true)
  const [magPos, setMagPos] = useState({ x: 0, y: 0, rx: 0, ry: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const MAGNIFICATION = 3
  const LENS_SIZE = 220

  const hasPrev = currentIndex !== null && currentIndex > 0
  const hasNext = currentIndex !== null && currentIndex < screenshots.length - 1
  const screenshot =
    currentIndex !== null ? screenshots[currentIndex] : null

  /* ---- Helpers ---- */
  const goTo = useCallback(
    (index: number) => {
      onIndexChange(index)
    },
    [onIndexChange],
  )

  const goNext = useCallback(() => {
    if (currentIndex === null) return
    if (currentIndex < screenshots.length - 1) {
      goTo(currentIndex + 1)
    } else {
      goTo(0) // loop: volta ao início
    }
  }, [currentIndex, screenshots.length, goTo])

  const goPrev = useCallback(() => {
    if (currentIndex === null) return
    if (currentIndex > 0) {
      goTo(currentIndex - 1)
    } else {
      goTo(screenshots.length - 1) // loop: vai ao fim
    }
  }, [currentIndex, screenshots.length, goTo])

  // Keep magnifier active on screenshot change
  useEffect(() => {
    setIsMagnifying(true)
  }, [currentIndex])

  /* ---- Loop / slideshow ---- */
  const startLoop = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const stopLoop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const toggleLoop = useCallback(() => {
    setIsPlaying((v) => !v)
  }, [])

  // Interval effect
  useEffect(() => {
    if (isPlaying && open && screenshots.length > 1) {
      intervalRef.current = setInterval(goNext, LOOP_INTERVAL_MS)
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, open, screenshots.length, goNext])

  // Pause on manual navigation
  const handleGoNext = useCallback(() => {
    stopLoop()
    goNext()
  }, [stopLoop, goNext])

  const handleGoPrev = useCallback(() => {
    stopLoop()
    goPrev()
  }, [stopLoop, goPrev])

  /* ---- Reset fullscreen + playing on dialog close ---- */
  useEffect(() => {
    if (!open) {
      setIsFullscreen(false)
      setIsPlaying(false)
    }
  }, [open])

  /* ---- Keyboard navigation ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || currentIndex === null) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        handleGoPrev()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleGoNext()
      } else if (e.key === " ") {
        e.preventDefault()
        toggleLoop()
      } else if ((e.key === "m" || e.key === "M") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setIsMagnifying((v) => !v)
      }
    },
    [open, currentIndex, handleGoPrev, handleGoNext, toggleLoop],
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
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasPrev}
              onClick={handleGoPrev}
              aria-label="Anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!hasNext}
              onClick={handleGoNext}
              aria-label="Próximo"
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            {/* Play / Pause */}
            {screenshots.length > 1 && (
              <Button
                variant={isPlaying ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={toggleLoop}
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                {isPlaying ? (
                  <PauseIcon className="size-4" />
                ) : (
                  <PlayIcon className="size-4" />
                )}
              </Button>
            )}

            {/* Magnifier toggle */}
            {screenshot?.signed_url && (
              <Button
                variant={isMagnifying ? "secondary" : "ghost"}
                size="icon-sm"
                onClick={() => setIsMagnifying((v) => !v)}
                aria-label={isMagnifying ? "Desativar lupa" : "Ativar lupa"}
                title="Lupa (Ctrl+M)"
              >
                <SearchIcon className="size-4" />
              </Button>
            )}

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
          <div
            ref={imageContainerRef}
            className={`relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted md:min-h-0 ${
              isMagnifying ? "cursor-none" : ""
            }`}
            onMouseMove={(e) => {
              if (!isMagnifying) return
              const cRect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - cRect.left
              const y = e.clientY - cRect.top

              // Compute ratios relative to the actual image content
              // (not the element box, which may include letterboxing)
              const imgEl = imgRef.current
              if (imgEl) {
                const iRect = imgEl.getBoundingClientRect()
                const mx = x - (iRect.left - cRect.left)
                const my = y - (iRect.top - cRect.top)

                const { displayW, displayH, offsetX, offsetY } = getImageDisplayRect(imgEl)
                const rx = clamp((mx - offsetX) / displayW, 0, 1)
                const ry = clamp((my - offsetY) / displayH, 0, 1)
                setMagPos({ x, y, rx, ry })
              } else {
                setMagPos({ x, y, rx: 0, ry: 0 })
              }
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {screenshot.signed_url ? (
              <img
                ref={imgRef}
                src={screenshot.signed_url}
                alt={`Screenshot - ${screenshot.user_name ?? "desconhecido"} - ${screenshot.captured_at}`}
                className="h-full w-full rounded-lg object-contain"
                draggable={false}
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-background/80 text-2xl font-medium text-foreground shadow-xs">
                {getInitial(screenshot.user_name)}
              </div>
            )}

            {/* Magnifier lens */}
            {isMagnifying && screenshot?.signed_url && isHovering && (
              (() => {
                const imgEl = imgRef.current
                if (!imgEl || imgEl.clientWidth === 0) return null

                const { displayW, displayH } = getImageDisplayRect(imgEl)

                return (
                  <div
                    className="pointer-events-none absolute overflow-hidden rounded-full border-2 border-white/60 shadow-xl"
                    style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      left: magPos.x,
                      top: magPos.y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <img
                      src={screenshot.signed_url}
                      alt=""
                      draggable={false}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: displayW,
                        height: displayH,
                        maxWidth: "none",
                        maxHeight: "none",
                        transform: `translate(${LENS_SIZE / 2 - magPos.rx * displayW * MAGNIFICATION}px, ${LENS_SIZE / 2 - magPos.ry * displayH * MAGNIFICATION}px) scale(${MAGNIFICATION})`,
                        transformOrigin: "0 0",
                      }}
                    />
                  </div>
                )
              })()
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

            {/* Duplicate badge */}
            {screenshot.is_duplicate && (
              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Classificação
                </h4>
                <div className="flex flex-wrap gap-2">
                  {screenshot.is_duplicate && (
                    <Badge variant="secondary" className="gap-1">
                      <CopyIcon className="size-3" />
                      Repetitiva
                    </Badge>
                  )}
                </div>
              </div>
            )}

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
