import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ScreenshotsGrid } from "~/components/screenshots/screenshots-grid"

export default function ScreenshotsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Screenshots
            </h1>
            <DashboardFilters />
          </div>
          <div className="px-4 lg:px-6">
            <ScreenshotsGrid />
          </div>
        </div>
      </div>
    </div>
  )
}
