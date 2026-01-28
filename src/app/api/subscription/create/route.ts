import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType, withTrial } = body;

    if (!planType || !["FREELANCER", "AGENCY"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Handle free trial for Freelancer plan
    if (withTrial && planType === "FREELANCER") {
      // Check IP-based trial eligibility
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                 request.headers.get("x-real-ip") || 
                 "unknown";

      const existingTrialByIP = await prisma.trialByIP.findUnique({
        where: { ipAddress: ip },
      });

      if (existingTrialByIP || user.hasUsedTrial) {
        return NextResponse.json(
          { error: "Trial already used" },
          { status: 400 }
        );
      }

      // Start free trial (7 days)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: "trialing",
            subscriptionPlan: planType,
            trialStartedAt: new Date(),
            trialEndsAt,
            hasUsedTrial: true,
            bridgeLimit: plan.bridgeLimit ?? 1,
          },
        }),
        prisma.trialByIP.create({
          data: {
            ipAddress: ip,
            userId: user.id,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        trial: true,
        trialEndsAt: trialEndsAt.toISOString(),
      });
    }

    // Create Stripe checkout session for paid subscription
    if (!plan.priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan" },
        { status: 400 }
      );
    }

    // If user is on trial, create subscription with trial end date
    const trialEnd = user.subscriptionStatus === "trialing" && user.trialEndsAt && user.trialEndsAt > new Date()
      ? Math.floor(user.trialEndsAt.getTime() / 1000)
      : undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/subscribe?checkout=cancelled`,
      metadata: {
        userId: user.id,
        planType,
      },
      subscription_data: {
        trial_end: trialEnd,
        metadata: {
          userId: user.id,
          planType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
