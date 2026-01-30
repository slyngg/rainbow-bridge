import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { prisma } from "@/lib/db";
import { generateEmbedding, MOCK_MODE } from "@/lib/openai";

export const maxDuration = 30;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  bridgeId: string;
}

interface RetrievedMessage {
  content: string;
  sender: string;
  platform: string;
  timestamp: Date;
}

function generateMockStreamResponse(userMessage: string, hasContext: boolean): ReadableStream {
  const encoder = new TextEncoder();
  
  let response: string;
  if (hasContext) {
    response = `Based on the conversation history, I found relevant discussions about "${userMessage.slice(0, 40)}..."

The team has been actively communicating across both Slack and Teams. Several messages relate to your query.

**Key Findings:**
- Multiple team members have contributed to this topic
- There are ongoing discussions that may be relevant
- Action items appear to be tracked across platforms

🎭 *This is a mock response. Set a real OPENAI_API_KEY to enable AI-powered answers.*`;
  } else {
    response = `I don't have any messages in the bridge history yet.

Once messages start flowing through your bridge (Slack ↔ Teams), I'll be able to:
- Search across all conversations
- Find decisions and who made them
- Track responsibilities and action items
- Summarize project discussions

🎭 *Mock mode active - deploy a bridge and send some test messages to see the intelligence layer in action!*`;
  }

  const words = response.split(" ");
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < words.length) {
        await new Promise(r => setTimeout(r, 30));
        controller.enqueue(encoder.encode(words[index] + " "));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

export async function POST(req: Request) {
  const { messages, bridgeId }: ChatRequest = await req.json();
  
  if (!bridgeId) {
    return new Response("Bridge ID required", { status: 400 });
  }
  
  const lastMessage = messages[messages.length - 1];
  const userMessage = typeof lastMessage?.content === "string" ? lastMessage.content : "";
  
  let contextLogs = "";
  
  try {
    const queryEmbedding = await generateEmbedding(userMessage);
    
    const relevantMessages = await prisma.$queryRaw<RetrievedMessage[]>`
      SELECT 
        content,
        sender,
        platform,
        timestamp
      FROM "MessageLog"
      WHERE "bridgeId" = ${bridgeId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${queryEmbedding}::vector
      LIMIT 15
    `;
    
    if (relevantMessages.length > 0) {
      contextLogs = relevantMessages
        .map((msg: RetrievedMessage, i: number) => {
          const date = new Date(msg.timestamp).toLocaleString();
          return `[${i + 1}] [${msg.platform.toUpperCase()}] ${msg.sender} (${date}): ${msg.content}`;
        })
        .join("\n\n");
    }
  } catch (error) {
    console.error("Error retrieving context:", error);
  }
  
  if (MOCK_MODE) {
    return new Response(generateMockStreamResponse(userMessage, contextLogs.length > 0), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  
  const systemPrompt = contextLogs
    ? `You are a project assistant for a cross-platform communication bridge that connects Slack and Microsoft Teams. Your role is to help users understand project history and find information from past conversations.

IMPORTANT INSTRUCTIONS:
- Answer the user's question using ONLY the context logs provided below
- If the information isn't in the context, say so honestly
- Reference specific messages when relevant (e.g., "According to [Platform] message from [Sender]...")
- Be concise but thorough
- If asked about decisions, summarize the key points and who made them
- If asked about responsibilities, identify the relevant person based on the context

CONTEXT LOGS FROM BRIDGE HISTORY:
${contextLogs}

Remember: Only use information from the context above. Do not make up information.`
    : `You are a project assistant for a cross-platform communication bridge. Currently, there are no messages in the bridge history to reference. Let the user know that once messages flow through the bridge, you'll be able to help them search and analyze the conversation history.`;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
