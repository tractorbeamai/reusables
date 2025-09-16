import type {
  BaseLLMConfig,
  BaseMessage,
  ContentBlock,
  GenerateOptions,
  GenerateResponse,
  IterateGenerateOptions,
  PartialReturn,
  StopReason,
  Tool,
  ToolUseBlock,
} from "@tractorbeamai/llm";
import type { JsonSchema7ObjectType } from "zod-to-json-schema";

import Anthropic from "@anthropic-ai/sdk";
import {
  BaseLLMProvider,
  convertStringToMessages,
  iterateFromMethods,
} from "@tractorbeamai/llm";
import zodToJsonSchema from "zod-to-json-schema";

export type AnthropicModel =
  | "claude-opus-4-0"
  | "claude-sonnet-4-0"
  | "claude-3-7-sonnet-latest"
  | "claude-3-5-haiku-latest";

export type AnthropicConfig = {
  apiKey: string;

  baseURL?: string;

  model?: AnthropicModel;

  systemPrompt?: string;

  tools?: Tool[];

  metadata?: Record<string, unknown>;

  maxRetries?: number;
} & BaseLLMConfig;

function mapStopReason(stopReason: string | null): StopReason | undefined {
  if (!stopReason) return undefined;

  const stopReasonMap: Record<string, StopReason> = {
    end_turn: "endTurn",
    max_tokens: "maxTokens",
    stop_sequence: "stopSequence",
    tool_use: "toolUse",
  };

  return stopReason in stopReasonMap ? stopReasonMap[stopReason] : undefined;
}

function mapContent(content: Anthropic.ContentBlockParam[]): ContentBlock[] {
  return content
    .map((block): ContentBlock | null => {
      switch (block.type) {
        case "text": {
          return { type: "text", text: block.text };
        }
        case "image": {
          return {
            type: "image",
            source:
              block.source.type === "base64"
                ? {
                    type: "base64",
                    mediaType: block.source.media_type,
                    data: block.source.data,
                  }
                : { type: "url", url: block.source.url },
          };
        }
        case "tool_use": {
          return {
            type: "toolUse",
            id: block.id,
            name: block.name,
            input: block.input,
          };
        }
        case "thinking": {
          return {
            type: "thinking",
            thinking: block.thinking,
            signature: block.signature || undefined,
          };
        }
        case "redacted_thinking": {
          return null;
        }
        default: {
          throw new Error(
            `Unsupported content block type: ${JSON.stringify(block, null, 2)}`
          );
        }
      }
    })
    .filter((block) => block !== null);
}

function convertContentBlock(
  block?: ContentBlock | string
): Anthropic.ContentBlockParam | string {
  if (!block) {
    return "";
  }

  if (typeof block === "string") {
    return block;
  }

  switch (block.type) {
    case "text": {
      {
        return { type: "text", text: block.text };
      }
    }
    case "image": {
      return {
        type: "image",
        source:
          block.source.type === "base64"
            ? {
                type: "base64",
                media_type: block.source.mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: block.source.data,
              }
            : { type: "url", url: block.source.url },
      };
    }
    case "document": {
      if (
        block.source.type === "base64" &&
        block.source.mediaType === "application/pdf"
      ) {
        return {
          type: "document",
          source: {
            type: "base64",
            data: block.source.data,
            media_type: "application/pdf",
          },
        };
      }
      if (block.source.type === "url") {
        return {
          type: "document",
          source: { type: "url", url: block.source.url },
        };
      }

      throw new Error(
        `Unsupported document type: ${JSON.stringify(block.source)}`
      );
    }
    case "toolUse": {
      return {
        type: "tool_use",
        id: block.id,
        name: block.name,
        input: block.input,
      };
    }
    case "toolResult": {
      return {
        type: "tool_result",
        tool_use_id: block.toolUseId,
        content:
          typeof block.content === "string"
            ? block.content
            : block.content?.map(
                (block) => convertContentBlock(block) as Anthropic.TextBlock
              ),
        is_error: block.isError,
      };
    }
    case "thinking": {
      return {
        type: "thinking",
        thinking: block.thinking,
        signature: block.signature!,
      };
    }
    default: {
      throw new Error(
        `Unsupported content block type: ${JSON.stringify(block, null, 2)}`
      );
    }
  }
}

function convertMessages(messages: BaseMessage[]): Anthropic.MessageParam[] {
  return messages
    .filter(
      (
        msg
      ): msg is Omit<BaseMessage, "role"> & { role: "user" | "assistant" } =>
        msg.role !== "system"
    )
    .map((msg) => ({
      role: msg.role,
      content: msg.content
        .map((block): Anthropic.ContentBlockParam => {
          return convertContentBlock(block) as Anthropic.ContentBlockParam;
        })
        .filter(Boolean),
    }))
    .filter((msg) => msg.content.length > 0);
}

function convertTool(tool: Tool): Anthropic.ToolUnion {
  const key = "schema";
  const result = zodToJsonSchema(tool.zodInputSchema, key);
  const inputSchema = result.definitions?.[key] as JsonSchema7ObjectType;

  return {
    name: tool.name,
    description: tool.description,
    input_schema: inputSchema,
  };
}

export class AnthropicProvider extends BaseLLMProvider {
  private client: Anthropic;
  private model: string;
  readonly name = "Claude";

  constructor(config: AnthropicConfig) {
    super();
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      maxRetries: config.maxRetries,
    });
    this.model = config.model ?? "claude-sonnet-4-0";
  }

  async generate(
    input: string | BaseMessage[],
    options?: Partial<GenerateOptions>
  ): Promise<GenerateResponse> {
    try {
      const messageArray = convertStringToMessages("user", input);
      const transformedMessages = convertMessages(messageArray);
      const transformedTools = options?.tools?.map(convertTool);

      const requestOptions: Anthropic.MessageCreateParams = {
        model: this.model,
        messages: transformedMessages,
        system: options?.systemPrompt,
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature,
        stop_sequences: options?.stopSequences,
        tools: transformedTools,
        thinking: options?.thinkingTokens
          ? { type: "enabled", budget_tokens: options.thinkingTokens }
          : undefined,
      };

      const response = await this.client.messages.create(requestOptions);

      return {
        content: mapContent(response.content),
        stopReason: mapStopReason(response.stop_reason),
        tokenUsage: {
          model: response.model,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error("Anthropic generation failed:", error);
      throw error instanceof Error
        ? new Error(`Anthropic generation failed: ${error.message}`)
        : new Error("Anthropic generation failed with unknown error");
    }
  }

  async *stream(
    input: string | BaseMessage[],
    options?: Partial<GenerateOptions>
  ): AsyncGenerator<PartialReturn, GenerateResponse, unknown> {
    try {
      const messageArray = convertStringToMessages("user", input);
      const transformedMessages = convertMessages(messageArray);
      const transformedTools = options?.tools?.map(convertTool);

      const streamOptions: Anthropic.MessageStreamParams = {
        model: this.model,
        messages: transformedMessages,
        system: options?.systemPrompt,
        max_tokens: options?.maxTokens ?? 8192,
        temperature: options?.temperature,
        stop_sequences: options?.stopSequences,
        tools: transformedTools,
        thinking: options?.thinkingTokens
          ? { type: "enabled", budget_tokens: options.thinkingTokens }
          : undefined,
      };

      const messageStream = this.client.messages.stream(streamOptions);

      let partialBlockType: ContentBlock["type"] | undefined;
      let partialToolUseBuffer = "";
      let partialToolUseBlock: ToolUseBlock | undefined;

      for await (const chunk of messageStream) {
        if (
          chunk.type === "content_block_start" &&
          chunk.content_block.type === "text"
        ) {
          if (partialBlockType !== undefined) {
            throw new Error(
              "Unexpected text start before previous block completed"
            );
          }
          partialBlockType = "text";
          // yield { type: "text", text: chunk.content_block.text };
          // weirdly, the text included here is also included in the subseqent delta
          yield { type: "text", text: "", isStart: true };
        } else if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          if (partialBlockType !== "text") {
            throw new Error("Unexpected text delta in non-text block");
          }
          yield { type: "text", text: chunk.delta.text };
        } else if (
          chunk.type === "content_block_stop" &&
          partialBlockType === "text"
        ) {
          yield { type: "text", text: "", isEnd: true };
          partialBlockType = undefined;
        } else if (
          chunk.type === "content_block_start" &&
          chunk.content_block.type === "tool_use"
        ) {
          if (partialBlockType !== undefined) {
            throw new Error(
              "Unexpected tool use start before previous block completed"
            );
          }
          partialBlockType = "toolUse";
          partialToolUseBuffer = "";
          partialToolUseBlock = {
            id: chunk.content_block.id,
            type: "toolUse",
            name: chunk.content_block.name,
            input: chunk.content_block.input,
          };
          yield {
            type: "toolUse",
            toolUse: partialToolUseBlock,
            isStart: true,
          };
        } else if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "input_json_delta"
        ) {
          if (partialBlockType !== "toolUse") {
            throw new Error("Unexpected tool use delta in non-tool use block");
          }
          partialToolUseBuffer += chunk.delta.partial_json;
          yield {
            type: "toolUse",
            toolUse: partialToolUseBlock,
            toolUseInputString: chunk.delta.partial_json,
          };
        } else if (
          chunk.type === "content_block_stop" &&
          partialBlockType === "toolUse"
        ) {
          if (partialToolUseBuffer.length === 0) {
            throw new Error("Tool use stop before any input was received");
          }
          partialToolUseBlock!.input = JSON.parse(partialToolUseBuffer);
          yield { type: "toolUse", toolUse: partialToolUseBlock, isEnd: true };
          partialBlockType = undefined;
        } else if (
          chunk.type === "content_block_start" &&
          chunk.content_block.type === "thinking"
        ) {
          if (partialBlockType !== undefined) {
            throw new Error(
              "Unexpected thinking start before previous block completed"
            );
          }
          yield {
            type: "thinking",
            thinking: chunk.content_block.thinking,
            signature: chunk.content_block.signature || undefined,
            isStart: true,
            isEnd: false,
          };
          partialBlockType = "thinking";
        } else if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "thinking_delta"
        ) {
          if (partialBlockType !== "thinking") {
            throw new Error("Unexpected thinking delta in non-thinking block");
          }
          yield { type: "thinking", thinking: chunk.delta.thinking };
        } else if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "signature_delta"
        ) {
          if (partialBlockType !== "thinking") {
            throw new Error("Unexpected signature delta in non-thinking block");
          }
          yield {
            type: "thinking",
            thinking: "",
            signature: chunk.delta.signature,
          };
        } else if (
          chunk.type === "content_block_stop" &&
          partialBlockType === "thinking"
        ) {
          yield { type: "thinking", thinking: "", isEnd: true };
          partialBlockType = undefined;
        }
      }

      const finalMessage = await messageStream.finalMessage();
      return {
        content: mapContent(finalMessage.content),
        stopReason: mapStopReason(finalMessage.stop_reason),
        tokenUsage: {
          model: finalMessage.model,
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error("Anthropic generation failed:", error);
      throw error instanceof Error
        ? new Error(`Anthropic generation failed: ${error.message}`)
        : new Error("Anthropic generation failed with unknown error");
    }
  }

  async *iterate(
    input: string | BaseMessage[],
    options: IterateGenerateOptions
  ): AsyncGenerator<PartialReturn, GenerateResponse, unknown> {
    return yield* iterateFromMethods(this, input, options);
  }
}
