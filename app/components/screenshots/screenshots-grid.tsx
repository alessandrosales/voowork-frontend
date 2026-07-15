import {
  Card,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export interface ScreenshotItem {
  id: string
  user: string
  initials: string
  timestamp: string
  hour: number
  thumbnailBg: string
}

interface HourGroup {
  hour: number
  label: string
  screenshots: ScreenshotItem[]
}

interface ScreenshotsGridProps {
  groups?: HourGroup[]
}

const MOCK_GROUPS: HourGroup[] = [
  {
    hour: 10,
    label: "10:00 — 10:59",
    screenshots: [
      {
        id: "1",
        user: "Ana Silva",
        initials: "AS",
        timestamp: "10:32",
        hour: 10,
        thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
      },
      {
        id: "2",
        user: "Carlos Oliveira",
        initials: "CO",
        timestamp: "10:28",
        hour: 10,
        thumbnailBg: "from-blue-500/20 to-blue-600/10",
      },
      {
        id: "3",
        user: "Marina Costa",
        initials: "MC",
        timestamp: "10:25",
        hour: 10,
        thumbnailBg: "from-violet-500/20 to-violet-600/10",
      },
      {
        id: "4",
        user: "Rafael Santos",
        initials: "RS",
        timestamp: "10:22",
        hour: 10,
        thumbnailBg: "from-amber-500/20 to-amber-600/10",
      },
      {
        id: "5",
        user: "Juliana Lima",
        initials: "JL",
        timestamp: "10:18",
        hour: 10,
        thumbnailBg: "from-rose-500/20 to-rose-600/10",
      },
      {
        id: "6",
        user: "Ana Silva",
        initials: "AS",
        timestamp: "10:05",
        hour: 10,
        thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
      },
    ],
  },
  {
    hour: 9,
    label: "09:00 — 09:59",
    screenshots: [
      {
        id: "7",
        user: "Carlos Oliveira",
        initials: "CO",
        timestamp: "09:52",
        hour: 9,
        thumbnailBg: "from-blue-500/20 to-blue-600/10",
      },
      {
        id: "8",
        user: "Marina Costa",
        initials: "MC",
        timestamp: "09:45",
        hour: 9,
        thumbnailBg: "from-violet-500/20 to-violet-600/10",
      },
      {
        id: "9",
        user: "Rafael Santos",
        initials: "RS",
        timestamp: "09:30",
        hour: 9,
        thumbnailBg: "from-amber-500/20 to-amber-600/10",
      },
      {
        id: "10",
        user: "Ana Silva",
        initials: "AS",
        timestamp: "09:15",
        hour: 9,
        thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
      },
      {
        id: "11",
        user: "Juliana Lima",
        initials: "JL",
        timestamp: "09:08",
        hour: 9,
        thumbnailBg: "from-rose-500/20 to-rose-600/10",
      },
    ],
  },
  {
    hour: 8,
    label: "08:00 — 08:59",
    screenshots: [
      {
        id: "12",
        user: "Carlos Oliveira",
        initials: "CO",
        timestamp: "08:45",
        hour: 8,
        thumbnailBg: "from-blue-500/20 to-blue-600/10",
      },
      {
        id: "13",
        user: "Ana Silva",
        initials: "AS",
        timestamp: "08:30",
        hour: 8,
        thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
      },
    ],
  },
]

function ScreenshotThumbnail({
  initials,
  bg,
}: {
  initials: string
  bg: string
}) {
  return (
    <div
      className={`flex aspect-[4/3] items-center justify-center rounded-t-md bg-gradient-to-br ${bg}`}
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-background/80 text-xs font-medium text-foreground shadow-xs">
        {initials}
      </div>
    </div>
  )
}

export function ScreenshotsGrid({
  groups = MOCK_GROUPS,
}: ScreenshotsGridProps) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.hour}>
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {group.screenshots.map((screenshot) => (
              <Card key={screenshot.id} size="sm" className="overflow-hidden pt-0 pb-0 gap-0">
                <ScreenshotThumbnail
                  initials={screenshot.initials}
                  bg={screenshot.thumbnailBg}
                />
                <CardHeader className="px-2.5 py-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium truncate">
                      {screenshot.user}
                    </CardTitle>
                    <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                      {screenshot.timestamp}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
