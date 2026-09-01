"use client"

import { useTranslation } from "react-i18next"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import type { Plan, Subscription } from "~/lib/api/types"
import { SubscriptionStatusBadge } from "./subscription-status"

interface SubscriptionPlanProps {
  subscription: Subscription
  plans: Plan[]
  onChangePlan: (planPriceId: string) => void
  isChangingPlan: boolean
}

export function SubscriptionPlan({
  subscription,
  plans,
  onChangePlan,
  isChangingPlan,
}: SubscriptionPlanProps) {
  const { t } = useTranslation()
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount)

  return (
    <Card className="gap-5">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">{subscription.plan.name}</CardTitle>
            <Badge variant="outline">
              {subscription.price.interval === "month"
                ? t("plans.monthly")
                : t("plans.yearly")}
            </Badge>
          </div>
          <SubscriptionStatusBadge subscription={subscription} />
        </div>
        <CardDescription>
          {formatAmount(subscription.price.amount, subscription.price.currency)}
          /{subscription.price.interval === "month" ? t("plans.month") : t("plans.year")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 rounded-md border p-4 text-sm sm:grid-cols-2">
          {subscription.current_period_end && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">{t("subscription.current-period")}</span>
              <span className="font-medium text-foreground">
                {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
          {subscription.trial_ends_at && (
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">{t("subscription.trial-ends")}</span>
              <span className="font-medium text-foreground">
                {new Date(subscription.trial_ends_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">{t("subscription.switch-plan")}</p>
          {plans
            .filter((plan) => plan.id !== subscription.plan.id)
            .map((plan) => {
              const price = plan.prices.find(
                (item) => item.interval === subscription.price.interval,
              ) ?? plan.prices[0]
              if (!price) return null

              const isUpgrade = price.amount > subscription.price.amount
              const isCompatibleCurrency = price.currency === subscription.price.currency

              return (
                <div
                  key={plan.id}
                  className="grid gap-3 rounded-md border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(price.amount, price.currency)}
                      /{price.interval === "month" ? t("plans.month") : t("plans.year")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isUpgrade ? "default" : "outline"}
                    disabled={isChangingPlan || !isCompatibleCurrency}
                    onClick={() => onChangePlan(price.id)}
                  >
                    {!isCompatibleCurrency
                      ? t("subscription.currency-mismatch")
                      : isChangingPlan
                        ? "Atualizando..."
                        : isUpgrade
                        ? t("subscription.upgrade")
                        : t("subscription.downgrade")}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
