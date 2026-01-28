"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Square, 
  Trash2, 
  MessageSquare, 
  Settings,
  Activity,
  Slack,
  Users
} from "lucide-react";
import Link from "next/link";

interface Bridge {
  id: string;
  name: string;
  status: "STOPPED" | "STARTING" | "RUNNING" | "ERROR";
  slackChannel: string;
  teamsChannel: string;
  createdAt: Date;
}

interface BridgeCardProps {
  bridge: Bridge;
  onDeploy: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  STOPPED: "secondary",
  STARTING: "warning",
  RUNNING: "success",
  ERROR: "destructive",
};

export function BridgeCard({ bridge, onDeploy, onStop, onDelete, isLoading }: BridgeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{bridge.name}</CardTitle>
        <Badge variant={statusVariants[bridge.status]}>
          {bridge.status === "RUNNING" && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
          {bridge.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Slack className="w-4 h-4 text-purple-500" />
              <span>{bridge.slackChannel}</span>
            </div>
            <span className="text-xs">↔</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{bridge.teamsChannel}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            {bridge.status === "STOPPED" || bridge.status === "ERROR" ? (
              <Button 
                size="sm" 
                onClick={() => onDeploy(bridge.id)}
                disabled={isLoading}
              >
                <Play className="w-4 h-4 mr-1" />
                Deploy
              </Button>
            ) : bridge.status === "RUNNING" ? (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStop(bridge.id)}
                disabled={isLoading}
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button size="sm" disabled>
                <Activity className="w-4 h-4 mr-1 animate-spin" />
                Starting...
              </Button>
            )}
            
            <Link href={`/dashboard/bridge/${bridge.id}`}>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-1" />
                Intelligence
              </Button>
            </Link>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(bridge.id)}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
