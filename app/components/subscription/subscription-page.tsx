"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  CreditCardIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { SubscriptionsService, PlansService, ApiError } from "~/lib/api"
import type { Subscription, Plan } from "~/lib/api/types"
import { SubscriptionPlan } from "./subscription-plan"
import { SubscriptionStatusBadge } from "./subscription-status"
import { CancelDialog } from "./cancel-dialog"
import { useAuth } from "~/hooks/use-auth"

export function SubscriptionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // ──────────────────────────────────────────────────────────────
  // Admin-only gate: only users with profile "admin" can manage
  // billing and subscriptions for the account.
  // ──────────────────────────────────────────────────────────────
  const isAdmin = user?.profile === "admin"

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [subRes, plansData] = await Promise.all([
        SubscriptionsService.get(),
        PlansService.list(),
      ])
      setSubscription(subRes.subscription)
      setPlans(plansData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t("subscription.load-error"))
      }
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Redirect to Stripe Checkout ---
  const handleStartSubscription = async (planPriceId: string) => {
    const successUrl = `${window.location.origin}/subscription`
    const cancelUrl = `${window.location.origin}/planos`

    try {
      const res = await SubscriptionsService.createCheckout({
        plan_price_id: planPriceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      window.location.href = res.checkout_url
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error(t("subscription.checkout-error"))
      }
    }
  }

  // --- Cancel subscription ---
  const handleCancel = async () => {
    setIsCanceling(true)
    try {
      await SubscriptionsService.cancel()
      toast.success(t("subscription.cancel-success"))
      setCancelDialogOpen(false)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error(t("subscription.cancel-error"))
      }
    } finally {
      setIsCanceling(false)
    }
  }

  // --- Open Stripe Customer Portal ---
  const handleManageBilling = () => {
    toast.info(t("subscription.portal-coming-soon"))
  }

  // --- Admin-only gate ---
  if (!isAdmin) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangleIcon className="size-8 text-destructive" />
                <p className="font-medium text-destructive">
                  {t("subscription.admin-only")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.admin-only-description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">{t("subscription.loading")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchData}>
                  {t("subscription.retry")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("subscription.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subscription.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-3">
            {/* Main content — plan details */}
            <div className="lg:col-span-2 space-y-6">
              {subscription ? (
                <>
                  {/* Active subscription */}
                  <SubscriptionPlan
                    subscription={subscription}
                    plans={plans}
                    onChangePlan={handleStartSubscription}
                  />

                  {/* Status card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("subscription.current-status")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SubscriptionStatusBadge subscription={subscription} />
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("subscription.actions")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={handleManageBilling}
                      >
                        <CreditCardIcon />
                        {t("subscription.manage-payment")}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        {t("subscription.cancel")}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* No subscription — show plan selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("subscription.no-subscription")}
                      </CardTitle>
                      <CardDescription>
                        {t("subscription.choose-plan-cta")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plans.map((plan) => {
                        const price = plan.prices[0]
                        if (!price) return null

                        return (
                          <div
                            key={plan.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {plan.description}
                              </p>
                            </div>
                            <Button
                              onClick={() =>
                                handleStartSubscription(price.id)
                              }
                            >
                              {t("subscription.start")}
                              <ArrowRightIcon />
                            </Button>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Sidebar — billing summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {t("subscription.billing-summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {subscription ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.plan")}
                        </span>
                        <span className="font-medium">
                          {subscription.plan.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.amount")}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            subscription.price.amount,
                            subscription.price.currency,
                          )}
                          /{subscription.price.interval === "month"
                            ? t("plans.month")
                            : t("plans.year")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.seats")}
                        </span>
                        <span>{subscription.quantity}</span>
                      </div>
                      {subscription.current_period_end && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("subscription.renews")}
                          </span>
                          <span>
                            {new Date(
                              subscription.current_period_end,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("subscription.no-active-plan")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Past due alert */}
              {subscription?.status === "past_due" && (
                <Card className="border-destructive">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <AlertTriangleIcon className="size-5 shrink-0 text-destructive" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">
                        {t("subscription.past-due-title")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("subscription.past-due-description")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <CancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancel}
        isCanceling={isCanceling}
      />
    </div>
  )
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount)
}
