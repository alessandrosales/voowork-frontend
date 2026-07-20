import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

export interface UserEntry {
  name: string
  time: string
  hours: number
}

interface UserActivityCardProps {
  users?: UserEntry[]
}

const DEFAULT_USERS: UserEntry[] = [
  { name: "Ana Silva", time: "42h 30m", hours: 42.5 },
  { name: "Carlos Oliveira", time: "38h 15m", hours: 38.25 },
  { name: "Marina Costa", time: "35h 45m", hours: 35.75 },
  { name: "Rafael Santos", time: "28h 20m", hours: 28.33 },
  { name: "Juliana Lima", time: "22h 10m", hours: 22.17 },
]

const MAX_HOURS = 42.5

export function UserActivityCard({
  users = DEFAULT_USERS,
}: UserActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo por usuário</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4">Usuário</TableHead>
              <TableHead className="w-24 px-4 text-right">Tempo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.name} className="group">
                <TableCell className="px-4">
                  <span>{user.name}</span>
                </TableCell>
                <TableCell className="w-24 px-4 text-right tabular-nums">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(user.hours / MAX_HOURS) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right">{user.time}</span>
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
