import { z } from "zod";
import type {
  AgentConfig,
  ToolDefinition,
  Message,
  ToolResult,
  LLMProvider,
} from "./types";
import { Agent } from "./agent";
import { createTool } from "./common-tools";

export class AgentBuilder {
  private config: Partial<AgentConfig> = {
    tools: [],
    maxIterations: 20,
  };

  name(name: string): this {
    this.config.name = name;
    return this;
  }

  description(description: string): this {
    this.config.description = description;
    return this;
  }

  systemPrompt(prompt: string): this {
    this.config.systemPrompt = prompt;
    return this;
  }

  llmProvider(provider: LLMProvider): this {
    this.config.llmProvider = provider;
    return this;
  }

  maxIterations(max: number): this {
    this.config.maxIterations = max;
    return this;
  }

  addTool(tool: ToolDefinition): this {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(tool);
    return this;
  }

  addTools(tools: ToolDefinition[]): this {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(...tools);
    return this;
  }

  addSimpleTool<TInput = unknown, TOutput = unknown>(
    name: string,
    description: string,
    inputSchema: z.ZodSchema<TInput>,
    handler: (input: TInput) => Promise<TOutput> | TOutput
  ): this {
    const tool = createTool({
      name,
      description,
      inputSchema,
      handler: async (input) => handler(input),
    });
    return this.addTool(tool as ToolDefinition);
  }

  addCommonTools(): this {
    const {
      thinkTool,
      calculateTool,
      memoryTool,
      concludeTool,
    } = require("./common-tools");

    return this.addTools([thinkTool, calculateTool, memoryTool, concludeTool]);
  }

  onMessage(handler: (message: Message) => void | Promise<void>): this {
    this.config.onMessage = handler;
    return this;
  }

  onToolCall(
    handler: (
      toolName: string,
      input: unknown,
      result: ToolResult
    ) => void | Promise<void>
  ): this {
    this.config.onToolCall = handler;
    return this;
  }

  onError(handler: (error: Error) => void | Promise<void>): this {
    this.config.onError = handler;
    return this;
  }

  build(): Agent {
    if (!this.config.name) {
      throw new Error("Agent name is required");
    }
    if (!this.config.llmProvider) {
      throw new Error("LLM provider is required");
    }
    if (!this.config.tools || this.config.tools.length === 0) {
      throw new Error("At least one tool is required");
    }

    return new Agent(this.config as AgentConfig);
  }

  static create(): AgentBuilder {
    return new AgentBuilder();
  }
}
