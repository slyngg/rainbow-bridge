import OpenAI from "openai";

const MOCK_MODE = process.env.OPENAI_API_KEY === "mock";

if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set");
} else if (MOCK_MODE) {
  console.log("🎭 Mock mode enabled - using simulated AI responses");
}

export const openai = MOCK_MODE 
  ? null as unknown as OpenAI 
  : new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateMockEmbedding(text: string): number[] {
  const seed = hashString(text);
  const embedding: number[] = [];
  
  for (let i = 0; i < 1536; i++) {
    const value = Math.sin(seed * (i + 1) * 0.001) * 0.5;
    embedding.push(value);
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map(v => v / magnitude);
}

function generateMockResponse(userMessage: string, context?: string): string {
  const responses = [
    `Based on the conversation history, I can see discussions about "${userMessage.slice(0, 30)}...". `,
    `Looking at the bridge messages, `,
    `From the context provided, `,
  ];
  
  const details = [
    "The team has been actively discussing this topic across both Slack and Teams.",
    "Several team members have contributed to this discussion.",
    "There appear to be some action items related to this query.",
    "The conversation shows progress on this matter.",
  ];
  
  const conclusions = [
    "\n\nNote: This is a mock response. Connect a real OpenAI API key for actual AI-powered answers.",
    "\n\n[Mock Mode Active - Set OPENAI_API_KEY to enable real responses]",
  ];
  
  const seed = hashString(userMessage);
  return responses[seed % responses.length] + 
         details[(seed >> 4) % details.length] + 
         conclusions[0];
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 100));
    return generateMockEmbedding(text);
  }
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  
  return response.data[0].embedding;
}

export async function streamChat(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  if (MOCK_MODE) {
    const response = generateMockResponse(userMessage, systemPrompt);
    const words = response.split(" ");
    
    for (const word of words) {
      await new Promise(r => setTimeout(r, 50));
      onChunk(word + " ");
    }
    return response;
  }
  
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    stream: true,
  });

  let fullResponse = "";
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullResponse += content;
    onChunk(content);
  }
  
  return fullResponse;
}

export { MOCK_MODE };
