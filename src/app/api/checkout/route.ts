import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planType } = body;

    if (!userId || !planType) {
      return NextResponse.json(
        { error: "Missing required fields: userId, planType" },
        { status: 400 }
      );
    }

    if (!["FREELANCER", "AGENCY"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type. Must be FREELANCER or AGENCY" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      planType: planType as "FREELANCER" | "AGENCY",
      successUrl: `${baseUrl}/dashboard?checkout=success`,
      cancelUrl: `${baseUrl}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
