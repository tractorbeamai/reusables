export type ZodSchema<T = unknown> = unknown;

export type Role = "system" | "user" | "assistant" | "tool";

export type TextBlock = { type: "text"; text: string };
export type ImageBlock = {
  type: "image";
  source:
    | {
        type: "base64";
        mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
      }
    | { type: "url"; url: string };
};
export type DocumentBlock = {
  type: "document";
  source:
    | { type: "base64"; mediaType: "application/pdf"; data: string }
    | { type: "url"; url: string };
};
export type ToolUseBlock = {
  type: "toolUse";
  id: string;
  name: string;
  input: unknown;
};
export type ToolResultBlock = {
  type: "toolResult";
  toolUseId: string;
  content: string | TextBlock[];
  isError?: boolean;
};
export type ThinkingBlock = {
  type: "thinking";
  thinking: string;
  signature?: string;
};

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | DocumentBlock
  | ToolUseBlock
  | ToolResultBlock
  | ThinkingBlock
  | string;

export interface BaseMessage {
  role: Role;
  content: ContentBlock[];
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  zodInputSchema: ZodSchema<any>;
}

export type StopReason = "endTurn" | "maxTokens" | "stopSequence" | "toolUse";

export interface TokenUsage {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface BaseLLMConfig {}

export interface GenerateOptions extends BaseLLMConfig {
  systemPrompt?: string;
  tools?: Tool[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  thinkingTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface GenerateResponse {
  content: ContentBlock[];
  stopReason?: StopReason;
  tokenUsage?: TokenUsage;
}

export type IterateGenerateOptions = GenerateOptions;

export type PartialText = {
  type: "text";
  text: string;
  isStart?: boolean;
  isEnd?: boolean;
};
export type PartialToolUse = {
  type: "toolUse";
  toolUse: ToolUseBlock;
  toolUseInputString?: string; // partial JSON from streaming providers
  isStart?: boolean;
  isEnd?: boolean;
};
export type PartialThinking = {
  type: "thinking";
  thinking: string;
  signature?: string;
  isStart?: boolean;
  isEnd?: boolean;
};

export type PartialReturn = PartialText | PartialToolUse | PartialThinking;

export abstract class BaseLLMProvider {
  abstract readonly name: string;

  abstract generate(
    input: string | BaseMessage[],
    options?: Partial<GenerateOptions>
  ): Promise<GenerateResponse>;

  abstract stream(
    input: string | BaseMessage[],
    options?: Partial<GenerateOptions>
  ): AsyncGenerator<PartialReturn, GenerateResponse, unknown>;

  async *iterate(
    input: string | BaseMessage[],
    options: IterateGenerateOptions
  ): AsyncGenerator<PartialReturn, GenerateResponse, unknown> {
    return yield* iterateFromMethods(this, input, options);
  }
}

export function convertStringToMessages(
  defaultRole: Exclude<Role, "system">,
  input: string | BaseMessage[]
): BaseMessage[] {
  if (typeof input === "string") {
    return [
      {
        role: defaultRole,
        content: [{ type: "text", text: input }],
      },
    ];
  }
  return input;
}

export async function* iterateFromMethods(
  provider: BaseLLMProvider,
  input: string | BaseMessage[],
  options: IterateGenerateOptions
): AsyncGenerator<PartialReturn, GenerateResponse, unknown> {
  return yield* provider.stream(input, options);
}
