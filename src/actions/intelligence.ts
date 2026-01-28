"use server";

import { prisma } from "@/lib/db";
import { generateEmbedding, openai } from "@/lib/openai";
import { streamText } from "ai";
import { openai as aiOpenai } from "@ai-sdk/openai";

interface RetrievedMessage {
  content: string;
  sender: string;
  platform: string;
  timestamp: Date;
  similarity: number;
}

export async function searchBridgeMessages(
  bridgeId: string,
  query: string,
  limit: number = 15
): Promise<RetrievedMessage[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);
  
  // Perform vector similarity search
  const results = await prisma.$queryRaw<RetrievedMessage[]>`
    SELECT 
      content,
      sender,
      platform,
      timestamp,
      1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "MessageLog"
    WHERE "bridgeId" = ${bridgeId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;
  
  return results;
}

export async function queryBridgeIntelligence(
  bridgeId: string,
  userQuery: string
): Promise<{ response: string; sources: RetrievedMessage[] }> {
  // Retrieve relevant context
  const relevantMessages = await searchBridgeMessages(bridgeId, userQuery, 15);
  
  if (relevantMessages.length === 0) {
    return {
      response: "I don't have any relevant context from the bridge history to answer this question. The bridge may not have processed any messages yet, or there's no relevant information stored.",
      sources: [],
    };
  }
  
  // Format context for the LLM
  const contextLogs = relevantMessages
    .map((msg, i) => {
      const date = new Date(msg.timestamp).toLocaleString();
      return `[${i + 1}] [${msg.platform.toUpperCase()}] ${msg.sender} (${date}): ${msg.content}`;
    })
    .join("\n\n");
  
  const systemPrompt = `You are a project assistant for a cross-platform communication bridge that connects Slack and Microsoft Teams. Your role is to help users understand project history and find information from past conversations.

IMPORTANT INSTRUCTIONS:
- Answer the user's question using ONLY the context logs provided below
- If the information isn't in the context, say so honestly
- Reference specific messages when relevant (e.g., "According to [Platform] message from [Sender]...")
- Be concise but thorough
- If asked about decisions, summarize the key points and who made them
- If asked about responsibilities, identify the relevant person based on the context

CONTEXT LOGS FROM BRIDGE HISTORY:
${contextLogs}

Remember: Only use information from the context above. Do not make up information.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });
  
  return {
    response: response.choices[0]?.message?.content || "Unable to generate response",
    sources: relevantMessages,
  };
}

export async function* streamBridgeIntelligence(
  bridgeId: string,
  userQuery: string
): AsyncGenerator<string> {
  // Retrieve relevant context
  const relevantMessages = await searchBridgeMessages(bridgeId, userQuery, 15);
  
  if (relevantMessages.length === 0) {
    yield "I don't have any relevant context from the bridge history to answer this question. The bridge may not have processed any messages yet, or there's no relevant information stored.";
    return;
  }
  
  // Format context for the LLM
  const contextLogs = relevantMessages
    .map((msg, i) => {
      const date = new Date(msg.timestamp).toLocaleString();
      return `[${i + 1}] [${msg.platform.toUpperCase()}] ${msg.sender} (${date}): ${msg.content}`;
    })
    .join("\n\n");
  
  const systemPrompt = `You are a project assistant for a cross-platform communication bridge that connects Slack and Microsoft Teams. Your role is to help users understand project history and find information from past conversations.

IMPORTANT INSTRUCTIONS:
- Answer the user's question using ONLY the context logs provided below
- If the information isn't in the context, say so honestly
- Reference specific messages when relevant (e.g., "According to [Platform] message from [Sender]...")
- Be concise but thorough
- If asked about decisions, summarize the key points and who made them
- If asked about responsibilities, identify the relevant person based on the context

CONTEXT LOGS FROM BRIDGE HISTORY:
${contextLogs}

Remember: Only use information from the context above. Do not make up information.`;

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    stream: true,
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function getMessageHistory(
  bridgeId: string,
  page: number = 1,
  pageSize: number = 50
) {
  const skip = (page - 1) * pageSize;
  
  const [messages, total] = await Promise.all([
    prisma.messageLog.findMany({
      where: { bridgeId },
      orderBy: { timestamp: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        platform: true,
        sender: true,
        content: true,
        timestamp: true,
      },
    }),
    prisma.messageLog.count({ where: { bridgeId } }),
  ]);
  
  return {
    messages,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
