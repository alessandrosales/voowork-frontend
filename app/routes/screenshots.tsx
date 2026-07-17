"use client"

import { useEffect, useState, useCallback } from "react"

import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ScreenshotsGrid } from "~/components/screenshots/screenshots-grid"
import { ScreenshotsService, ApiError } from "~/lib/api"
import type { Screenshot, ScreenshotFilters } from "~/lib/api/types"

export default function ScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScreenshotFilters>({})

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    ScreenshotsService.list(filters)
      .then((data) => {
        if (!cancelled) {
          setScreenshots(data)
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
  }, [filters])

  const handleApplyFilters = useCallback((newFilters: ScreenshotFilters) => {
    setFilters(newFilters)
  }, [])

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
        </div>
      </div>
    </div>
  )
}
