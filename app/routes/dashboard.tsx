"use client"

import { useEffect, useState } from "react"

import { ActivityTimeline, convertToComponentDays } from "~/components/dashboard/activity-timeline"
import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ScreenshotsCard } from "~/components/dashboard/screenshots-card"
import { SectionCards } from "~/components/dashboard/section-cards"
import { TopActivitiesCard } from "~/components/dashboard/top-activities-card"
import { TopAppsCard } from "~/components/dashboard/top-apps-card"
import { TopSitesCard } from "~/components/dashboard/top-sites-card"
import { UserActivityCard } from "~/components/dashboard/user-activity-card"
import { ReportsService, ScreenshotsService, ApiError } from "~/lib/api"
import type {
  CountersData,
  Screenshot,
  ScreenshotFilters,
  UserActivityEntry,
  TopActivityEntry,
  TopAppEntry,
  TopSiteEntry,
} from "~/lib/api/types"
import type { TimelineDay } from "~/components/dashboard/activity-timeline"

export default function Page() {
  const [filters, setFilters] = useState<ScreenshotFilters>({})

  // --- 4 lower cards ---
  const [userActivity, setUserActivity] = useState<UserActivityEntry[]>([])
  const [topActivities, setTopActivities] = useState<TopActivityEntry[]>([])
  const [topApps, setTopApps] = useState<TopAppEntry[]>([])
  const [topSites, setTopSites] = useState<TopSiteEntry[]>([])

  // --- Counters (section cards) ---
  const [counters, setCounters] = useState<CountersData | null>(null)
  const [countersError, setCountersError] = useState<string | null>(null)

  // --- Screenshots ---
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [screenshotsError, setScreenshotsError] = useState<string | null>(null)

  // --- Timeline ---
  const [timelineDays, setTimelineDays] = useState<TimelineDay[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setCountersError(null)
    setScreenshotsError(null)

    Promise.all([
      // 4 lower cards
      ReportsService.userActivity(filters),
      ReportsService.topActivities(filters),
      ReportsService.topApps(filters),
      ReportsService.topSites(filters),
      // Counters
      ReportsService.counters(filters),
      // Screenshots
      ScreenshotsService.list({ ...filters, limit: 20 }),
      // Timeline
      ReportsService.timeline(filters),
    ])
      .then(([ua, ta, apps, sites, cnt, ss, tl]) => {
        if (cancelled) return
        setUserActivity(ua.data)
        setTopActivities(ta.data)
        setTopApps(apps.data)
        setTopSites(sites.data)
        setCounters(cnt.data)
        setScreenshots(ss.data)
        setTimelineDays(convertToComponentDays(tl.data))
      })
      .catch((err) => {
        if (cancelled) return

        if (err instanceof ApiError) {
          setCountersError(err.message)
          setScreenshotsError(err.message)
        } else {
          const msg = "Erro ao carregar dados do dashboard."
          setCountersError(msg)
          setScreenshotsError(msg)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  function handleApply(newFilters: ScreenshotFilters) {
    setFilters(newFilters)
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <DashboardFilters onApply={handleApply} />
          </div>
          <SectionCards counters={counters} loading={loading} error={countersError} />
          <div className="px-4 lg:px-6">
            <ScreenshotsCard
              screenshots={screenshots}
              isLoading={loading}
              error={screenshotsError}
            />
          </div>
          <div className="px-4 lg:px-6">
            <ActivityTimeline days={timelineDays} />
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <UserActivityCard users={userActivity} />
            <TopActivitiesCard activities={topActivities} />
            <TopAppsCard apps={topApps} />
            <TopSitesCard sites={topSites} />
          </div>
        </div>
      </div>
    </div>
  )
}
