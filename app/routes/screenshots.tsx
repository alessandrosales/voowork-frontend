"use client"

import { useEffect, useState, useCallback } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ScreenshotsGrid } from "~/components/screenshots/screenshots-grid"
import { ScreenshotsService, ApiError } from "~/lib/api"
import type {
  Screenshot,
  ScreenshotFilters,
  PaginationMeta,
} from "~/lib/api/types"

const DEFAULT_LIMIT = 50

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScreenshotFilters>({})
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  // Reset to page 1 whenever filters change
  const handleApplyFilters = useCallback((newFilters: ScreenshotFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    ScreenshotsService.list({ ...filters, page, limit: DEFAULT_LIMIT })
      .then((res) => {
        if (!cancelled) {
          setScreenshots(res.data)
          setPagination(res.pagination)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message)
          } else {
            setError("Erro ao carregar screenshots. Verifique o servidor.")
          }
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [filters, page])

  const totalLabel =
    pagination
      ? `Página ${pagination.page} de ${pagination.pages} (${pagination.count} total)`
      : null

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Screenshots
            </h1>
            <DashboardFilters onApply={handleApplyFilters} />
          </div>
          <div className="px-4 lg:px-6">
            <ScreenshotsGrid
              screenshots={screenshots}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 lg:px-6">
              <p className="text-sm text-muted-foreground">{totalLabel}</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={pagination.prev === null}
                  onClick={() => setPage(1)}
                  aria-label="Primeira página"
                >
                  <ChevronsLeftIcon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={pagination.prev === null}
                  onClick={() => setPage(pagination.prev!)}
                  aria-label="Página anterior"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="min-w-[6rem] text-center text-sm tabular-nums text-muted-foreground">
                  {pagination.page} / {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={pagination.next === null}
                  onClick={() => setPage(pagination.next!)}
                  aria-label="Próxima página"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={pagination.next === null}
                  onClick={() => setPage(pagination.pages)}
                  aria-label="Última página"
                >
                  <ChevronsRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
