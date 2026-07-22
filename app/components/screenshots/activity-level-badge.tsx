import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import type { Screenshot } from "~/lib/api/types"

type ActivityLevel = NonNullable<Screenshot["activity_level"]>

const ACTIVITY_LEVEL_CONFIG: Record<
  ActivityLevel,
  { label: string; dotClassName: string }
> = {
  low: {
    label: "Baixa atividade",
    dotClassName: "bg-amber-500 dark:bg-amber-400",
  },
  medium: {
    label: "Média atividade",
    dotClassName: "bg-emerald-500 dark:bg-emerald-400",
  },
  high: {
    label: "Alta atividade",
    dotClassName: "bg-blue-500 dark:bg-blue-400",
  },
}

interface ActivityLevelBadgeProps {
  level: ActivityLevel
  className?: string
}

export function ActivityLevelBadge({
  level,
  className,
}: Readonly<ActivityLevelBadgeProps>) {
  const config = ACTIVITY_LEVEL_CONFIG[level]

  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 font-normal text-[10px]", className)}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", config.dotClassName)}
        aria-hidden
      />
      {config.label}
    </Badge>
  )
}
