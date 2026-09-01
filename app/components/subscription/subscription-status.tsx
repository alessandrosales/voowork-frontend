import { Badge } from "~/components/ui/badge"
import { useTranslation } from "react-i18next"
import type { Subscription, SubscriptionStatus } from "~/lib/api/types"

const STATUS_MAP: Record<
  SubscriptionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  trialing: { label: "Em Trial", variant: "secondary" },
  active: { label: "Ativa", variant: "default" },
  past_due: { label: "Pagamento Pendente", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "outline" },
  incomplete: { label: "Incompleta", variant: "outline" },
  incomplete_expired: { label: "Expirada", variant: "outline" },
  paused: { label: "Pausada", variant: "secondary" },
}

interface SubscriptionStatusBadgeProps {
  subscription: Subscription
}

export function SubscriptionStatusBadge({
  subscription,
}: SubscriptionStatusBadgeProps) {
  const { t } = useTranslation()
  const config = STATUS_MAP[subscription.status]

  return (
    <Badge variant={config.variant}>
      {t(`subscription.status.${subscription.status}`, {
        defaultValue: config.label,
      })}
    </Badge>
  )
}
