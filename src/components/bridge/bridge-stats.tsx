"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Slack, Users, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BridgeStatsProps {
  stats: {
    totalMessages: number;
    platformBreakdown: Record<string, number>;
    recentMessages: Array<{
      sender: string;
      content: string;
      platform: string;
      timestamp: Date;
    }>;
  };
}

export function BridgeStats({ stats }: BridgeStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalMessages}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              From Slack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Slack className="w-5 h-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {stats.platformBreakdown.slack || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              From Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {stats.platformBreakdown.teams || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {stats.recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages yet. Messages will appear here once the bridge is running.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentMessages.map((msg, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <Badge 
                      variant={msg.platform === "slack" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {msg.platform === "slack" ? (
                        <Slack className="w-3 h-3 mr-1" />
                      ) : (
                        <Users className="w-3 h-3 mr-1" />
                      )}
                      {msg.platform}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
