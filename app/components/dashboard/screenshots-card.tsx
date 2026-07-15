import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export interface ScreenshotEntry {
  user: string
  initials: string
  time: string
  thumbnailBg: string
}

interface ScreenshotsCardProps {
  screenshots?: ScreenshotEntry[]
}

const DEFAULT_SCREENSHOTS: ScreenshotEntry[] = [
  {
    user: "Ana Silva",
    initials: "AS",
    time: "10:32",
    thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    user: "Carlos Oliveira",
    initials: "CO",
    time: "10:28",
    thumbnailBg: "from-blue-500/20 to-blue-600/10",
  },
  {
    user: "Marina Costa",
    initials: "MC",
    time: "10:25",
    thumbnailBg: "from-violet-500/20 to-violet-600/10",
  },
  {
    user: "Rafael Santos",
    initials: "RS",
    time: "10:22",
    thumbnailBg: "from-amber-500/20 to-amber-600/10",
  },
  {
    user: "Juliana Lima",
    initials: "JL",
    time: "10:18",
    thumbnailBg: "from-rose-500/20 to-rose-600/10",
  },
  {
    user: "Ana Silva",
    initials: "AS",
    time: "10:05",
    thumbnailBg: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    user: "Carlos Oliveira",
    initials: "CO",
    time: "09:52",
    thumbnailBg: "from-blue-500/20 to-blue-600/10",
  },
  {
    user: "Marina Costa",
    initials: "MC",
    time: "09:45",
    thumbnailBg: "from-violet-500/20 to-violet-600/10",
  },
]

export function ScreenshotsCard({
  screenshots = DEFAULT_SCREENSHOTS,
}: ScreenshotsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Screenshots</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {screenshots.map((screenshot, i) => (
            <div
              key={i}
              className="flex w-44 shrink-0 flex-col gap-2 rounded-lg border bg-gradient-to-b p-2"
            >
              {/* Thumbnail placeholder */}
              <div
                className={`flex aspect-video items-center justify-center rounded-md bg-gradient-to-br ${screenshot.thumbnailBg}`}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-background/80 text-sm font-medium text-foreground">
                  {screenshot.initials}
                </div>
              </div>
              {/* Info */}
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-medium">
                  {screenshot.user}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {screenshot.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
