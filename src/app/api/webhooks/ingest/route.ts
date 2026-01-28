import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEmbedding } from "@/lib/openai";

interface MatterbridgePayload {
  text: string;
  username: string;
  gateway: string;
  channel: string;
  account: string;
  event: string;
  protocol: string;
  userid?: string;
  avatar?: string;
  id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.slice(7);
    const payload: MatterbridgePayload = await request.json();
    
    // Extract bridgeId from gateway name (format: "bridge-{uuid}")
    const bridgeIdMatch = payload.gateway?.match(/bridge-([a-f0-9-]+)/i);
    if (!bridgeIdMatch) {
      return NextResponse.json({ error: "Invalid gateway format" }, { status: 400 });
    }
    
    const bridgeId = bridgeIdMatch[1];
    
    // Validate token against bridge
    const bridge = await prisma.bridge.findFirst({
      where: {
        id: bridgeId,
        apiToken: token,
        intelligenceEnabled: true,
      },
    });
    
    if (!bridge) {
      return NextResponse.json({ error: "Invalid token or bridge not found" }, { status: 403 });
    }
    
    // Skip empty messages or system events
    if (!payload.text || payload.text.trim() === "") {
      return NextResponse.json({ success: true, skipped: true });
    }
    
    // Determine platform from account
    let platform = "unknown";
    if (payload.account.startsWith("slack.")) {
      platform = "slack";
    } else if (payload.account.startsWith("msteams.")) {
      platform = "teams";
    } else if (payload.account.startsWith("api.")) {
      platform = "api";
    }
    
    // Generate embedding for the message
    const embedding = await generateEmbedding(payload.text);
    
    // Insert message with vector using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "MessageLog" (id, "bridgeId", platform, sender, content, embedding, timestamp)
      VALUES (
        gen_random_uuid(),
        ${bridgeId},
        ${platform},
        ${payload.username},
        ${payload.text},
        ${embedding}::vector,
        NOW()
      )
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: "Message ingested and embedded" 
    });
    
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "healthy",
    service: "Rainbow Bridge Intelligence Layer",
    version: "1.0.0"
  });
}
