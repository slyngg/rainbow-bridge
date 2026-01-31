import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        subscriptionStatus: true,
        subscriptionPlan: true,
        trialEndsAt: true,
        trialStartedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        hasActiveSubscription: false,
        status: null,
        plan: null,
      });
    }

    // Check if user has an active subscription or trial
    const isTrialing = user.subscriptionStatus === "trialing" && 
                       user.trialEndsAt && 
                       user.trialEndsAt > new Date();
    
    const isActive = user.subscriptionStatus === "active";
    
    const hasActiveSubscription = isTrialing || isActive;

    // Calculate days left in trial
    let daysLeft = 0;
    if (isTrialing && user.trialEndsAt) {
      daysLeft = Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      hasActiveSubscription,
      status: user.subscriptionStatus,
      plan: user.subscriptionPlan,
      isTrialing,
      trialEndsAt: user.trialEndsAt?.toISOString() || null,
      daysLeft,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
