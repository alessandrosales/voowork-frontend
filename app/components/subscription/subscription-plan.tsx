"use client"

import { useTranslation } from "react-i18next"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { CheckIcon, ArrowRightIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import type { Subscription, Plan } from "~/lib/api/types"

interface SubscriptionPlanProps {
  subscription: Subscription
  plans: Plan[]
  onChangePlan: (planPriceId: string) => void
}

export function SubscriptionPlan({
  subscription,
  plans,
  onChangePlan,
}: SubscriptionPlanProps) {
  const { t } = useTranslation()

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {subscription.plan.name}
          <Badge variant="outline" className="text-xs">
            {subscription.price.interval === "month"
              ? t("plans.monthly")
              : t("plans.yearly")}
          </Badge>
        </CardTitle>
        <CardDescription>
          {formatAmount(subscription.price.amount, subscription.price.currency)}
          /{subscription.price.interval === "month"
            ? t("plans.month")
            : t("plans.year")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {subscription.current_period_end && (
            <p>
              {t("subscription.current-period")}:{" "}
              {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
            </p>
          )}
          {subscription.trial_ends_at && (
            <p>
              {t("subscription.trial-ends")}:{" "}
              {new Date(subscription.trial_ends_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>

        {/* Other plans available for upgrade/downgrade */}
        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium">{t("subscription.switch-plan")}</p>
          {plans
            .filter((p) => p.id !== subscription.plan.id)
            .map((plan) => {
              const price = plan.prices.find(
                (p) => p.interval === subscription.price.interval,
              ) ?? plan.prices[0]
              if (!price) return null

              const isUpgrade = price.amount > subscription.price.amount

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAmount(price.amount, price.currency)}
                        /{price.interval === "month"
                          ? t("plans.month")
                          : t("plans.year")}
                        {isUpgrade && (
                          <span className="ml-1 text-xs text-green-600 font-medium">
                            ↑
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isUpgrade ? "default" : "outline"}
                    onClick={() => onChangePlan(price.id)}
                  >
                    {isUpgrade
                      ? t("subscription.upgrade")
                      : t("subscription.downgrade")}
                    <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
