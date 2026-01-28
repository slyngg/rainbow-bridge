import Stripe from "stripe";

// Lazy-load Stripe client to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any, // forcing any to bypass version mismatch for now
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  FREELANCER: {
    name: "Freelancer",
    priceId: process.env.STRIPE_FREELANCER_PRICE_ID || "",
    price: 29,
    bridgeLimit: 1,
    historyDays: 7,
  },
  AGENCY: {
    name: "Agency",
    priceId: process.env.STRIPE_AGENCY_PRICE_ID || "",
    price: 99,
    bridgeLimit: 5,
    historyDays: null, // unlimited
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: null, // custom pricing
    price: null,
    bridgeLimit: null, // unlimited
    historyDays: null, // unlimited
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession({
  userId,
  userEmail,
  planType,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planType: "FREELANCER" | "AGENCY";
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const plan = PLANS[planType];

  if (!plan.priceId) {
    throw new Error(`Price ID not configured for plan: ${planType}`);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: userEmail,
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planType,
    },
    subscription_data: {
      metadata: {
        userId,
        planType,
      },
    },
  });

  return session;
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch {
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const subscription = await getStripe().subscriptions.cancel(subscriptionId);
  return subscription;
}

export function getBridgeLimitForPlan(planType: PlanType | null): number {
  if (!planType) return 1; // Free tier default
  return PLANS[planType]?.bridgeLimit ?? 1;
}
