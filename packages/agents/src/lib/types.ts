import { z } from "zod";

// Base message types following a structure similar to OpenAI/Anthropic
export type Role = "system" | "user" | "assistant" | "tool";

export interface TextContent {
  type: "text";
  text: string;
}

export interface ToolUseContent {
  type: "tool_use";
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultContent {
  type: "tool_result";
  tool_use_id: string;
  content: string | object;
  is_error?: boolean;
}

export type MessageContent =
  | string
  | TextContent
  | ToolUseContent
  | ToolResultContent;

export interface Message {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  metadata?: Record<string, unknown>;
}

// Tool definition system
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  handler: (
    input: TInput,
    context: ToolContext
  ) => Promise<ToolResult<TOutput>>;
  // Optional configuration
  config?: {
    maxRetries?: number;
    timeout?: number;
    requiresConfirmation?: boolean;
  };
}

export interface ToolContext {
  messages: Message[];
  metadata: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

// LLM Provider abstraction
export interface LLMProvider {
  name: string;
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
}

export interface LLMRequest {
  messages: Message[];
  tools?: ToolDefinition[];
  toolChoice?: "auto" | "none" | { type: "tool"; name: string };
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface LLMResponse {
  message: Message;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

// Agent configuration
export interface AgentConfig {
  name: string;
  description?: string;
  systemPrompt?: string;
  tools: ToolDefinition[];
  llmProvider: LLMProvider;
  maxIterations?: number;
  onMessage?: (message: Message) => void | Promise<void>;
  onToolCall?: (
    toolName: string,
    input: unknown,
    result: ToolResult
  ) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

// Agent execution
export interface AgentExecutionOptions {
  initialMessages?: Message[];
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
  stream?: boolean;
}

export interface AgentExecutionResult {
  messages: Message[];
  iterations: number;
  metadata: Record<string, unknown>;
  error?: Error;
}

// Streaming support
export interface AgentStreamEvent {
  type: "message" | "tool_call" | "tool_result" | "error" | "complete";
  data: unknown;
  timestamp: Date;
}

