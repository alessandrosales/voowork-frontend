import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

export interface ActivityRankEntry {
  name: string
  color: string
  time: string
  hours: number
}

interface TopActivitiesCardProps {
  activities?: ActivityRankEntry[]
}

const DEFAULT_ACTIVITIES: ActivityRankEntry[] = [
  { name: "Tempo no Computador", color: "bg-emerald-500", time: "89h 30m", hours: 89.5 },
  { name: "Reuniões", color: "bg-blue-500", time: "32h 15m", hours: 32.25 },
  { name: "Tempo Manual", color: "bg-amber-400", time: "18h 40m", hours: 18.67 },
  { name: "Desenvolvimento", color: "bg-violet-500", time: "15h 20m", hours: 15.33 },
  { name: "Code Review", color: "bg-cyan-500", time: "8h 45m", hours: 8.75 },
]

const MAX_HOURS = 89.5

export function TopActivitiesCard({
  activities = DEFAULT_ACTIVITIES,
}: TopActivitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Atividade</TableHead>
              <TableHead className="w-24 px-4 text-right">Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.name} className="group">
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <div className={`size-3 rounded-sm ${activity.color}`} />
                    <span>{activity.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-24 px-4 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${activity.color}`}
                        style={{
                          width: `${(activity.hours / MAX_HOURS) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right">{activity.time}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
