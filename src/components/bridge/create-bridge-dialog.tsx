"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Slack, Users } from "lucide-react";
import { createBridge } from "@/actions/bridge";

interface CreateBridgeDialogProps {
  onCreated: () => void;
}

export function CreateBridgeDialog({ onCreated }: CreateBridgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await createBridge(formData);
      setOpen(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create bridge:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Bridge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Bridge</DialogTitle>
            <DialogDescription>
              Connect a Slack channel to a Microsoft Teams channel with AI-powered intelligence.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Bridge Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Project Alpha Bridge"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Slack className="w-4 h-4 text-purple-500" />
                Slack Configuration
              </div>
              <div className="grid gap-3 pl-6">
                <div className="space-y-2">
                  <label htmlFor="slackToken" className="text-sm text-muted-foreground">
                    Bot Token (xoxb-...)
                  </label>
                  <Input
                    id="slackToken"
                    name="slackToken"
                    type="password"
                    placeholder="xoxb-your-bot-token"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="slackChannel" className="text-sm text-muted-foreground">
                    Channel Name
                  </label>
                  <Input
                    id="slackChannel"
                    name="slackChannel"
                    placeholder="#general"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-blue-500" />
                Microsoft Teams Configuration
              </div>
              <div className="grid gap-3 pl-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="teamsAppId" className="text-sm text-muted-foreground">
                      App ID
                    </label>
                    <Input
                      id="teamsAppId"
                      name="teamsAppId"
                      placeholder="Application ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="teamsTenantId" className="text-sm text-muted-foreground">
                      Tenant ID
                    </label>
                    <Input
                      id="teamsTenantId"
                      name="teamsTenantId"
                      placeholder="Tenant ID"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="teamsAppPassword" className="text-sm text-muted-foreground">
                    App Password / Client Secret
                  </label>
                  <Input
                    id="teamsAppPassword"
                    name="teamsAppPassword"
                    type="password"
                    placeholder="Client Secret"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="teamsTeamId" className="text-sm text-muted-foreground">
                      Team ID
                    </label>
                    <Input
                      id="teamsTeamId"
                      name="teamsTeamId"
                      placeholder="Team ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="teamsChannel" className="text-sm text-muted-foreground">
                      Channel Name
                    </label>
                    <Input
                      id="teamsChannel"
                      name="teamsChannel"
                      placeholder="General"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Bridge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
