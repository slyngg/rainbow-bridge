import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has already used trial
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { hasUsedTrial: true },
    });

    if (user?.hasUsedTrial) {
      return NextResponse.json({ canUseTrial: false });
    }

    // Check IP-based trial
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";

    if (ip === "unknown") {
      return NextResponse.json({ canUseTrial: false });
    }

    const existingTrialByIP = await prisma.trialByIP.findUnique({
      where: { ipAddress: ip },
    });

    return NextResponse.json({ canUseTrial: !existingTrialByIP });
  } catch (error) {
    console.error("Check trial error:", error);
    return NextResponse.json(
      { error: "Failed to check trial eligibility" },
      { status: 500 }
    );
  }
}
