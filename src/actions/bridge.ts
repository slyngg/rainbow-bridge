"use server";

import { prisma } from "@/lib/db";
import { 
  generateTomlConfig, 
  createBridgeContainer, 
  startContainer, 
  stopContainer, 
  removeContainer,
  getContainerStatus,
  getContainerLogs,
  pullImage,
  type BridgeConfig 
} from "@/lib/docker";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

const DEMO_USER_ID = "demo-user-001";

async function ensureDemoUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@rainbow-bridge.dev",
        name: "Demo User",
      },
    });
  }
  
  return user;
}

export async function createBridge(formData: FormData) {
  const user = await ensureDemoUser();
  
  const name = formData.get("name") as string;
  const slackToken = formData.get("slackToken") as string;
  const slackChannel = formData.get("slackChannel") as string;
  const teamsAppId = formData.get("teamsAppId") as string;
  const teamsAppPassword = formData.get("teamsAppPassword") as string;
  const teamsTenantId = formData.get("teamsTenantId") as string;
  const teamsTeamId = formData.get("teamsTeamId") as string;
  const teamsChannel = formData.get("teamsChannel") as string;
  
  const apiToken = uuidv4();
  
  const bridge = await prisma.bridge.create({
    data: {
      name,
      userId: user.id,
      slackToken,
      slackChannel,
      slackTeamName: "agency",
      teamsAppId,
      teamsAppPassword,
      teamsTenantId,
      teamsTeamId,
      teamsChannel,
      apiToken,
      intelligenceEnabled: true,
    },
  });
  
  revalidatePath("/dashboard");
  return { success: true, bridgeId: bridge.id };
}

export async function deployBridge(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({
    where: { id: bridgeId },
  });
  
  if (!bridge) {
    return { success: false, error: "Bridge not found" };
  }
  
  try {
    // Update status to starting
    await prisma.bridge.update({
      where: { id: bridgeId },
      data: { status: "STARTING" },
    });
    
    // Pull image if needed
    try {
      await pullImage();
    } catch {
      // Image might already exist
    }
    
    const config: BridgeConfig = {
      id: bridge.id,
      name: bridge.name,
      slackToken: bridge.slackToken,
      slackChannel: bridge.slackChannel,
      slackTeamName: bridge.slackTeamName,
      teamsAppId: bridge.teamsAppId,
      teamsAppPassword: bridge.teamsAppPassword,
      teamsTenantId: bridge.teamsTenantId,
      teamsTeamId: bridge.teamsTeamId,
      teamsChannel: bridge.teamsChannel,
      apiToken: bridge.apiToken,
      hostUrl: process.env.NEXT_PUBLIC_APP_URL || "http://host.docker.internal:3000",
    };
    
    const toml = generateTomlConfig(config);
    const containerId = await createBridgeContainer(config, toml);
    
    await prisma.bridge.update({
      where: { id: bridgeId },
      data: { 
        containerId,
        status: "RUNNING",
      },
    });
    
    revalidatePath("/dashboard");
    return { success: true, containerId };
    
  } catch (error) {
    await prisma.bridge.update({
      where: { id: bridgeId },
      data: { status: "ERROR" },
    });
    
    console.error("Deploy error:", error);
    return { success: false, error: String(error) };
  }
}

export async function stopBridgeAction(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({
    where: { id: bridgeId },
  });
  
  if (!bridge || !bridge.containerId) {
    return { success: false, error: "Bridge or container not found" };
  }
  
  try {
    await stopContainer(bridge.containerId);
    
    await prisma.bridge.update({
      where: { id: bridgeId },
      data: { status: "STOPPED" },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
    
  } catch (error) {
    console.error("Stop error:", error);
    return { success: false, error: String(error) };
  }
}

export async function startBridgeAction(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({
    where: { id: bridgeId },
  });
  
  if (!bridge || !bridge.containerId) {
    return { success: false, error: "Bridge or container not found" };
  }
  
  try {
    await startContainer(bridge.containerId);
    
    await prisma.bridge.update({
      where: { id: bridgeId },
      data: { status: "RUNNING" },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
    
  } catch (error) {
    console.error("Start error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteBridge(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({
    where: { id: bridgeId },
  });
  
  if (!bridge) {
    return { success: false, error: "Bridge not found" };
  }
  
  try {
    if (bridge.containerId) {
      await removeContainer(bridge.containerId);
    }
    
    await prisma.bridge.delete({
      where: { id: bridgeId },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
    
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: String(error) };
  }
}

export async function getBridges() {
  const user = await ensureDemoUser();
  
  const bridges = await prisma.bridge.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  
  // Update statuses from Docker
  const bridgesWithStatus = await Promise.all(
    bridges.map(async (bridge) => {
      if (bridge.containerId) {
        const dockerStatus = await getContainerStatus(bridge.containerId);
        
        let status = bridge.status;
        if (dockerStatus === "running" && bridge.status !== "RUNNING") {
          status = "RUNNING";
        } else if (dockerStatus === "exited" && bridge.status === "RUNNING") {
          status = "STOPPED";
        } else if (dockerStatus === "not_found" && bridge.containerId) {
          status = "ERROR";
        }
        
        if (status !== bridge.status) {
          await prisma.bridge.update({
            where: { id: bridge.id },
            data: { status },
          });
        }
        
        return { ...bridge, status };
      }
      return bridge;
    })
  );
  
  return bridgesWithStatus;
}

export async function getBridgeLogs(bridgeId: string) {
  const bridge = await prisma.bridge.findUnique({
    where: { id: bridgeId },
  });
  
  if (!bridge || !bridge.containerId) {
    return { success: false, error: "Bridge or container not found" };
  }
  
  try {
    const logs = await getContainerLogs(bridge.containerId, 200);
    return { success: true, logs };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function getBridgeStats(bridgeId: string) {
  const messageCount = await prisma.messageLog.count({
    where: { bridgeId },
  });
  
  const platformCounts = await prisma.messageLog.groupBy({
    by: ["platform"],
    where: { bridgeId },
    _count: true,
  });
  
  const recentMessages = await prisma.messageLog.findMany({
    where: { bridgeId },
    orderBy: { timestamp: "desc" },
    take: 5,
    select: {
      sender: true,
      content: true,
      platform: true,
      timestamp: true,
    },
  });
  
  return {
    totalMessages: messageCount,
    platformBreakdown: platformCounts.reduce((acc, item) => {
      acc[item.platform] = item._count;
      return acc;
    }, {} as Record<string, number>),
    recentMessages,
  };
}
