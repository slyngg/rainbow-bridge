"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { IntelligenceChat } from "@/components/chat/intelligence-chat";
import { BridgeStats } from "@/components/bridge/bridge-stats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Play, 
  Square, 
  Activity, 
  MessageSquare,
  BarChart3,
  FileText,
  Rainbow,
  Slack,
  Users
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  getBridges, 
  getBridgeStats, 
  deployBridge, 
  stopBridgeAction,
  getBridgeLogs 
} from "@/actions/bridge";

interface Bridge {
  id: string;
  name: string;
  status: "STOPPED" | "STARTING" | "RUNNING" | "ERROR";
  slackChannel: string;
  teamsChannel: string;
  createdAt: Date;
}

interface BridgeStatsData {
  totalMessages: number;
  platformBreakdown: Record<string, number>;
  recentMessages: Array<{
    sender: string;
    content: string;
    platform: string;
    timestamp: Date;
  }>;
}

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  STOPPED: "secondary",
  STARTING: "warning",
  RUNNING: "success",
  ERROR: "destructive",
};

export default function BridgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [stats, setStats] = useState<BridgeStatsData | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const bridges = await getBridges();
      const found = bridges.find((b: Bridge) => b.id === id);
      if (found) {
        setBridge(found as Bridge);
        const bridgeStats = await getBridgeStats(id);
        setStats(bridgeStats);
        
        if (found.containerId) {
          const logsResult = await getBridgeLogs(id);
          if (logsResult.success && logsResult.logs) {
            setLogs(logsResult.logs);
          }
        }
      }
    });
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDeploy = () => {
    startTransition(async () => {
      await deployBridge(id);
      loadData();
    });
  };

  const handleStop = () => {
    startTransition(async () => {
      await stopBridgeAction(id);
      loadData();
    });
  };

  if (!bridge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Rainbow className="w-6 h-6 text-purple-500" />
          <span>Loading bridge...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Rainbow className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{bridge.name}</h1>
                    <Badge variant={statusVariants[bridge.status]}>
                      {bridge.status === "RUNNING" && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                      {bridge.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Slack className="w-3 h-3 text-purple-500" />
                    <span>{bridge.slackChannel}</span>
                    <span>↔</span>
                    <Users className="w-3 h-3 text-blue-500" />
                    <span>{bridge.teamsChannel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {bridge.status === "STOPPED" || bridge.status === "ERROR" ? (
                <Button onClick={handleDeploy} disabled={isPending}>
                  <Play className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              ) : bridge.status === "RUNNING" ? (
                <Button variant="outline" onClick={handleStop} disabled={isPending}>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button disabled>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          <div className="flex flex-col">
            <Tabs defaultValue="intelligence" className="flex-1 flex flex-col">
              <TabsList className="w-fit">
                <TabsTrigger value="intelligence">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Intelligence
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stats
                </TabsTrigger>
                <TabsTrigger value="logs">
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="intelligence" className="flex-1 mt-4">
                <div className="h-full">
                  <IntelligenceChat bridgeId={id} bridgeName={bridge.name} />
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="mt-4">
                {stats && <BridgeStats stats={stats} />}
              </TabsContent>
              
              <TabsContent value="logs" className="mt-4">
                <div className="bg-muted rounded-lg p-4 h-[500px] overflow-auto">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {logs || "No logs available. Deploy the bridge to see logs."}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden lg:block">
            <div className="h-full">
              <IntelligenceChat bridgeId={id} bridgeName={bridge.name} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
