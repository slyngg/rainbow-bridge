"use client";

import { useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Rainbow, Check, Loader2, ArrowLeft, CreditCard } from "lucide-react";

const PLANS: Record<string, { name: string; price: number; description: string; features: string[]; popular?: boolean }> = {
  FREELANCER: {
    name: "Freelancer",
    price: 29,
    description: "Perfect for solo consultants bridging client workspaces",
    features: [
      "1 Bridge",
      "Basic Intelligence",
      "7-day message history",
      "Email support",
    ],
  },
  AGENCY: {
    name: "Agency",
    price: 99,
    description: "For teams managing multiple client relationships",
    features: [
      "5 Bridges",
      "Full Intelligence",
      "Unlimited message history",
      "Priority support",
      "Custom bridge names",
    ],
    popular: true,
  },
};

function SubscribeForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [selectedPlan, setSelectedPlan] = useState<"FREELANCER" | "AGENCY">(
    (preselectedPlan?.toUpperCase() as "FREELANCER" | "AGENCY") || "FREELANCER"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Check if user already has active subscription
        const statusRes = await fetch("/api/subscription/status");
        const statusData = await statusRes.json();
        
        if (statusData.hasActiveSubscription) {
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to check subscription:", error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    if (isLoaded && user) {
      checkSubscription();
    }
  }, [isLoaded, user, router]);

  const handleSubscribe = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("Subscription error:", data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setIsLoading(false);
    }
  };

  if (!isLoaded || checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-500/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-500/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Rainbow className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">Rainbow Bridge</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Choose your plan
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Select the plan that works best for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {(Object.entries(PLANS) as [string, (typeof PLANS)[string]][]).map(
            ([key, plan]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key as "FREELANCER" | "AGENCY")}
                className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                  selectedPlan === key
                    ? "border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === key
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-border"
                    }`}
                  >
                    {selectedPlan === key && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-indigo-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            )
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold">Secure Payment via Stripe</span>
          </div>
          <p className="text-muted-foreground mb-6">
            Get started with {PLANS[selectedPlan].name} for $
            {PLANS[selectedPlan].price}/month.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue to Payment
                <CreditCard className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need enterprise features?{" "}
          <a
            href="mailto:sales@mogul.io"
            className="text-indigo-500 hover:text-indigo-400"
          >
            Contact sales
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-indigo-500/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <SubscribeForm />
    </Suspense>
  );
}
