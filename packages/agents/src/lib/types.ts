import { z } from "zod";
import type { BaseMessage, ContentBlock, Role, Tool } from "@tractorbeamai/llm";

// Re-export types from @llm for convenience
export type { BaseMessage as Message, ContentBlock as MessageContent, Role };

// Agent-specific content types that extend @llm
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

// Tool definition with handler (extends @llm Tool)
export interface ToolDefinition<TInput = unknown, TOutput = unknown>
  extends Omit<Tool, "zodInputSchema"> {
  inputSchema: z.ZodSchema<TInput>;
  handler: (
    input: TInput,
    context: ToolContext
  ) => Promise<ToolResult<TOutput>>;
  config?: {
    maxRetries?: number;
    timeout?: number;
    requiresConfirmation?: boolean;
  };
}

export interface ToolContext {
  messages: BaseMessage[];
  metadata: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

// LLM Provider interface for agents (simplified to use @llm types)
export interface LLMProvider {
  name: string;
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
}

export interface LLMRequest {
  messages: BaseMessage[];
  tools?: ToolDefinition[];
  toolChoice?: "auto" | "none" | { type: "tool"; name: string };
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface LLMResponse {
  message: BaseMessage;
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
  onMessage?: (message: BaseMessage) => void | Promise<void>;
  onToolCall?: (
    toolName: string,
    input: unknown,
    result: ToolResult
  ) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

// Agent execution
export interface AgentExecutionOptions {
  initialMessages?: BaseMessage[];
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
  stream?: boolean;
}

export interface AgentExecutionResult {
  messages: BaseMessage[];
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
