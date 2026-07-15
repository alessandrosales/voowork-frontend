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

export interface AppEntry {
  name: string
  time: string
  hours: number
}

interface TopAppsCardProps {
  apps?: AppEntry[]
}

const DEFAULT_APPS: AppEntry[] = [
  { name: "VS Code", time: "42h 30m", hours: 42.5 },
  { name: "Figma", time: "18h 15m", hours: 18.25 },
  { name: "Slack", time: "12h 40m", hours: 12.67 },
  { name: "Chrome", time: "8h 20m", hours: 8.33 },
  { name: "Terminal", time: "6h 10m", hours: 6.17 },
]

const MAX_HOURS = 42.5

export function TopAppsCard({ apps = DEFAULT_APPS }: TopAppsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Principais Apps</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">App</TableHead>
              <TableHead className="w-24 px-4 text-right">Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.name} className="group">
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <span>{app.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-24 px-4 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${(app.hours / MAX_HOURS) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right">{app.time}</span>
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
