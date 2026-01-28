"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect } from "react";

interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'data' | 'tool';
  content: string;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntelligenceChatProps {
  bridgeId: string;
  bridgeName: string;
}

const SUGGESTED_QUERIES = [
  "What was the last decision on the UI design?",
  "Did we deploy to prod yet?",
  "Who is responsible for the API bug?",
  "Summarize the key discussions from this week",
  "What are the open action items?",
];

export function IntelligenceChat({ bridgeId, bridgeName }: IntelligenceChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
    body: { bridgeId },
  } as any) as any;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      <div className="flex items-center gap-2 p-4 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <div>
          <h3 className="font-semibold">Project Intelligence</h3>
          <p className="text-xs text-muted-foreground">
            Ask questions about {bridgeName} conversation history
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Bot className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">Ask me anything about your project</h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              I have full context of all messages that have passed through this bridge.
              Try asking about decisions, responsibilities, or project status.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTED_QUERIES.map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuery(query)}
                  className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your project..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
