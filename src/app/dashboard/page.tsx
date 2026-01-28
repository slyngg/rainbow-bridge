"use client";

import { useEffect, useState, useTransition } from "react";
import { BridgeCard } from "@/components/bridge/bridge-card";
import { CreateBridgeDialog } from "@/components/bridge/create-bridge-dialog";
import { getBridges, deployBridge, stopBridgeAction, deleteBridge } from "@/actions/bridge";
import { Rainbow, Zap } from "lucide-react";

interface Bridge {
  id: string;
  name: string;
  status: "STOPPED" | "STARTING" | "RUNNING" | "ERROR";
  slackChannel: string;
  teamsChannel: string;
  createdAt: Date;
}

export default function DashboardPage() {
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadBridges = () => {
    startTransition(async () => {
      const data = await getBridges();
      setBridges(data as Bridge[]);
    });
  };

  useEffect(() => {
    loadBridges();
  }, []);

  const handleDeploy = async (id: string) => {
    startTransition(async () => {
      await deployBridge(id);
      loadBridges();
    });
  };

  const handleStop = async (id: string) => {
    startTransition(async () => {
      await stopBridgeAction(id);
      loadBridges();
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bridge?")) return;
    startTransition(async () => {
      await deleteBridge(id);
      loadBridges();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Rainbow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Rainbow Bridge</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Sovereign Bridge</p>
            </div>
          </div>
          <CreateBridgeDialog onCreated={loadBridges} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <h2 className="text-2xl font-bold">Your Bridges</h2>
          </div>
          <p className="text-muted-foreground">
            Connect Slack and Teams channels with AI-powered intelligence layer
          </p>
        </div>

        {bridges.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Rainbow className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bridges yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first bridge to connect Slack and Teams channels. 
              All messages will be indexed for AI-powered search and analysis.
            </p>
            <CreateBridgeDialog onCreated={loadBridges} />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bridges.map((bridge) => (
              <BridgeCard
                key={bridge.id}
                bridge={bridge}
                onDeploy={handleDeploy}
                onStop={handleStop}
                onDelete={handleDelete}
                isLoading={isPending}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
