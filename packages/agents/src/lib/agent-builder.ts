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

  /**
   * Set the agent name
   */
  name(name: string): this {
    this.config.name = name;
    return this;
  }

  /**
   * Set the agent description
   */
  description(description: string): this {
    this.config.description = description;
    return this;
  }

  /**
   * Set the system prompt
   */
  systemPrompt(prompt: string): this {
    this.config.systemPrompt = prompt;
    return this;
  }

  /**
   * Set the LLM provider
   */
  llmProvider(provider: LLMProvider): this {
    this.config.llmProvider = provider;
    return this;
  }

  /**
   * Set the maximum number of iterations
   */
  maxIterations(max: number): this {
    this.config.maxIterations = max;
    return this;
  }

  /**
   * Add a tool to the agent
   */
  addTool(tool: ToolDefinition): this {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(tool);
    return this;
  }

  /**
   * Add multiple tools
   */
  addTools(tools: ToolDefinition[]): this {
    if (!this.config.tools) {
      this.config.tools = [];
    }
    this.config.tools.push(...tools);
    return this;
  }

  /**
   * Add a simple tool with just a function
   */
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

  /**
   * Add common tools (think, calculate, memory, conclude)
   */
  addCommonTools(): this {
    const {
      thinkTool,
      calculateTool,
      memoryTool,
      concludeTool,
    } = require("./common-tools");

    return this.addTools([thinkTool, calculateTool, memoryTool, concludeTool]);
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: Message) => void | Promise<void>): this {
    this.config.onMessage = handler;
    return this;
  }

  /**
   * Set tool call handler
   */
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

  /**
   * Set error handler
   */
  onError(handler: (error: Error) => void | Promise<void>): this {
    this.config.onError = handler;
    return this;
  }

  /**
   * Build the agent
   */
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

  /**
   * Create a new builder instance
   */
  static create(): AgentBuilder {
    return new AgentBuilder();
  }
}
