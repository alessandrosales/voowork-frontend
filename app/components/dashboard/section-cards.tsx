import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { CountersData } from "~/lib/api/types"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatHours(hours: number): string {
  const int = Math.floor(hours)
  const dec = Math.round((hours - int) * 10)
  if (dec === 0) return `${int}h`
  return `${int},${dec}h`
}

function formatCount(n: number): string {
  return n.toLocaleString("pt-BR")
}

/* ------------------------------------------------------------------ */
/*  Card configuration                                                */
/* ------------------------------------------------------------------ */

interface CardConfig {
  key: keyof CountersData
  description: string
  formatValue: (v: number) => string
  footer: string
}

const CARDS: CardConfig[] = [
  {
    key: "users_count",
    description: "Usuários Ativos",
    formatValue: formatCount,
    footer: "Total de usuários na conta",
  },
  {
    key: "projects_count",
    description: "Projetos no Período",
    formatValue: formatCount,
    footer: "Total de projetos",
  },
  {
    key: "tasks_count",
    description: "Tasks no Período",
    formatValue: formatCount,
    footer: "Total de tarefas",
  },
  {
    key: "total_hours",
    description: "Horas de Atividade",
    formatValue: formatHours,
    footer: "Total de horas registradas",
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface SectionCardsProps {
  counters: CountersData | null
  loading?: boolean
  error?: string | null
}

export function SectionCards({
  counters,
  loading = false,
  error = null,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {loading ? (
        <>
          {CARDS.map((card) => (
            <Card key={card.key} className="@container/card">
              <CardHeader>
                <CardDescription>{card.description}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  <span className="text-muted-foreground">—</span>
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">Carregando...</div>
              </CardFooter>
            </Card>
          ))}
        </>
      ) : error ? (
        <Card className="@container/card col-span-full">
          <CardHeader>
            <CardDescription>Indicadores</CardDescription>
            <CardTitle className="text-base font-medium text-destructive">
              {error}
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <>
          {CARDS.map((card) => {
            const value = counters ? counters[card.key] : 0
            return (
              <Card key={card.key} className="@container/card">
                <CardHeader>
                  <CardDescription>{card.description}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {card.formatValue(value as number)}
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="text-muted-foreground">{card.footer}</div>
                </CardFooter>
              </Card>
            )
          })}
        </>
      )}
    </div>
  )
}
