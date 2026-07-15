import { ActivityTimeline } from "~/components/dashboard/activity-timeline"
import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ScreenshotsCard } from "~/components/dashboard/screenshots-card"
import { SectionCards } from "~/components/dashboard/section-cards"
import { TopActivitiesCard } from "~/components/dashboard/top-activities-card"
import { TopAppsCard } from "~/components/dashboard/top-apps-card"
import { TopSitesCard } from "~/components/dashboard/top-sites-card"
import { UserActivityCard } from "~/components/dashboard/user-activity-card"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
            <DashboardFilters />
          </div>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ScreenshotsCard />
          </div>
          <div className="px-4 lg:px-6">
            <ActivityTimeline />
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <UserActivityCard />
            <TopActivitiesCard />
            <TopAppsCard />
            <TopSitesCard />
          </div>
        </div>
      </div>
    </div>
  )
}
