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

export interface SiteEntry {
  name: string
  time: string
  hours: number
}

interface TopSitesCardProps {
  sites?: SiteEntry[]
}

const DEFAULT_SITES: SiteEntry[] = [
  { name: "github.com", time: "15h 30m", hours: 15.5 },
  { name: "stackoverflow.com", time: "8h 45m", hours: 8.75 },
  { name: "vercel.com", time: "6h 20m", hours: 6.33 },
  { name: "notion.so", time: "5h 15m", hours: 5.25 },
  { name: "npmjs.com", time: "3h 10m", hours: 3.17 },
]

const MAX_HOURS = 15.5

export function TopSitesCard({ sites = DEFAULT_SITES }: TopSitesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo por site</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Site</TableHead>
              <TableHead className="w-24 px-4 text-right">Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.name} className="group">
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <span>{site.name}</span>
                  </div>
                </TableCell>
                <TableCell className="w-24 px-4 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{
                          width: `${(site.hours / MAX_HOURS) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right">{site.time}</span>
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
