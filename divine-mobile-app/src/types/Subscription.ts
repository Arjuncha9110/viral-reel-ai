export interface SubscriptionPlan {
  planId: string;
  name: "free" | "premium";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: number | null;
}
