import type { Message, MessageContent, ToolUseContent } from "./types";

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function estimateTokens(message: Message): number {
  const contentToString = (content: MessageContent): string => {
    if (typeof content === "string") return content;
    if (content.type === "text") return content.text;
    return JSON.stringify(content);
  };

  const text = Array.isArray(message.content)
    ? message.content.map(contentToString).join(" ")
    : contentToString(message.content);

  return Math.ceil(text.length / 4);
}

export function estimateTotalTokens(messages: Message[]): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg), 0);
}

export function truncateMessages(
  messages: Message[],
  maxTokens: number,
  keepSystemPrompt = true
): Message[] {
  const result: Message[] = [];
  let totalTokens = 0;

  const systemMessage = messages.find((m) => m.role === "system");
  if (keepSystemPrompt && systemMessage) {
    result.push(systemMessage);
    totalTokens += estimateTokens(systemMessage);
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "system" && keepSystemPrompt) continue;

    const tokens = estimateTokens(message);
    if (totalTokens + tokens > maxTokens) break;

    result.unshift(message);
    totalTokens += tokens;
  }

  return result;
}

export function extractConclusion(messages: Message[]): any | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "assistant") continue;

    const content = Array.isArray(message.content)
      ? message.content
      : [message.content];

    for (const item of content) {
      if (
        typeof item === "object" &&
        item.type === "tool_use" &&
        item.name === "conclude"
      ) {
        return (item as ToolUseContent).input;
      }
    }
  }

  return null;
}

export function summarizeConversation(messages: Message[]): {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  toolCalls: number;
  estimatedTokens: number;
  conclusion: any | null;
} {
  let userMessages = 0;
  let assistantMessages = 0;
  let toolCalls = 0;

  for (const message of messages) {
    if (message.role === "user") userMessages++;
    else if (message.role === "assistant") assistantMessages++;

    const content = Array.isArray(message.content)
      ? message.content
      : [message.content];

    toolCalls += content.filter(
      (c: any): c is ToolUseContent =>
        typeof c === "object" && "type" in c && c.type === "tool_use"
    ).length;
  }

  return {
    totalMessages: messages.length,
    userMessages,
    assistantMessages,
    toolCalls,
    estimatedTokens: estimateTotalTokens(messages),
    conclusion: extractConclusion(messages),
  };
}

export class RateLimiter {
  private queue: (() => void)[] = [];
  private running = 0;

  constructor(private maxConcurrent: number, private minDelay: number = 0) {}

  async acquire(): Promise<void> {
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    if (this.minDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.minDelay));
    }
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i === maxRetries) break;

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * factor, maxDelay);
    }
  }

  throw lastError!;
}
