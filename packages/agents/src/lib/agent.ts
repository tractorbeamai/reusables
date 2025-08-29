import { EventEmitter } from "events";
import type {
  Message,
  MessageContent,
  ToolDefinition,
  ToolContext,
  AgentConfig,
  AgentExecutionOptions,
  AgentExecutionResult,
  AgentStreamEvent,
} from "./types";
import { ToolRegistry } from "./tool-registry";
import { MessageManager } from "./message-manager";

export interface AgentEvents {
  message: (message: Message) => void;
  toolCall: (toolName: string, input: unknown) => void;
  toolResult: (toolName: string, result: any) => void;
  iteration: (iteration: number) => void;
  error: (error: Error) => void;
  complete: (result: AgentExecutionResult) => void;
}

export class Agent extends EventEmitter {
  private toolRegistry: ToolRegistry;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.toolRegistry = new ToolRegistry();

    // Register all tools
    this.toolRegistry.registerMany(config.tools);
  }

  /**
   * Execute the agent loop
   */
  async execute(
    options: AgentExecutionOptions = {}
  ): Promise<AgentExecutionResult> {
    const {
      initialMessages = [],
      metadata = {},
      signal,
      stream = false,
    } = options;

    const messageManager = new MessageManager(initialMessages);
    const executionMetadata = { ...metadata };

    // Add system prompt if provided
    if (this.config.systemPrompt) {
      messageManager.addMessage(
        MessageManager.createSystemMessage(this.config.systemPrompt)
      );
    }

    let iteration = 0;
    const maxIterations = this.config.maxIterations ?? 20;
    let error: Error | undefined;

    try {
      while (iteration < maxIterations) {
        // Check if we should abort
        if (signal?.aborted) {
          throw new Error("Execution aborted");
        }

        iteration++;
        this.emit("iteration", iteration);

        // Get current messages
        const messages = messageManager.getMessages();

        // Call LLM provider
        const llmResponse = await this.config.llmProvider.generateResponse({
          messages,
          tools: this.toolRegistry.getAll(),
          toolChoice: "auto",
          metadata: executionMetadata,
        });

        // Add the response to messages
        messageManager.addMessage(llmResponse.message);
        this.emit("message", llmResponse.message);

        // Handle message callbacks
        if (this.config.onMessage) {
          await this.config.onMessage(llmResponse.message);
        }

        // Extract and execute tool calls
        const toolCalls = MessageManager.extractToolCalls(llmResponse.message);

        if (toolCalls.length === 0) {
          // No tool calls, agent is done
          break;
        }

        // Execute tool calls in parallel
        const toolResults = await Promise.all(
          toolCalls.map(async (toolCall) => {
            this.emit("toolCall", toolCall.name, toolCall.input);

            const context: ToolContext = {
              messages: messageManager.getMessages(),
              metadata: executionMetadata,
              signal,
            };

            const result = await this.toolRegistry.execute(
              toolCall.name,
              toolCall.input,
              context
            );

            this.emit("toolResult", toolCall.name, result);

            // Handle tool call callbacks
            if (this.config.onToolCall) {
              await this.config.onToolCall(
                toolCall.name,
                toolCall.input,
                result
              );
            }

            return {
              toolCall,
              result,
            };
          })
        );

        // Add tool results as messages
        const toolResultContents: MessageContent[] = toolResults.map(
          ({ toolCall, result }) =>
            MessageManager.createToolResultContent(
              toolCall.id,
              result.success
                ? result.data ?? { success: true }
                : { error: result.error },
              !result.success
            )
        );

        messageManager.addMessage({
          role: "user",
          content: toolResultContents,
        });

        // Stream events if requested
        if (stream) {
          const event: AgentStreamEvent = {
            type: "tool_result",
            data: toolResults,
            timestamp: new Date(),
          };
          this.emit("stream", event);
        }
      }

      const result: AgentExecutionResult = {
        messages: messageManager.getMessages(),
        iterations: iteration,
        metadata: executionMetadata,
      };

      this.emit("complete", result);
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      this.emit("error", error);

      if (this.config.onError) {
        await this.config.onError(error);
      }

      return {
        messages: messageManager.getMessages(),
        iterations: iteration,
        metadata: executionMetadata,
        error,
      };
    }
  }

  /**
   * Execute the agent with streaming support
   */
  async *stream(
    options: AgentExecutionOptions = {}
  ): AsyncGenerator<AgentStreamEvent, AgentExecutionResult, unknown> {
    const events: AgentStreamEvent[] = [];

    // Set up event collectors
    const messageHandler = (message: Message) => {
      const event: AgentStreamEvent = {
        type: "message",
        data: message,
        timestamp: new Date(),
      };
      events.push(event);
    };

    const toolCallHandler = (toolName: string, input: unknown) => {
      const event: AgentStreamEvent = {
        type: "tool_call",
        data: { toolName, input },
        timestamp: new Date(),
      };
      events.push(event);
    };

    const toolResultHandler = (toolName: string, result: any) => {
      const event: AgentStreamEvent = {
        type: "tool_result",
        data: { toolName, result },
        timestamp: new Date(),
      };
      events.push(event);
    };

    const errorHandler = (error: Error) => {
      const event: AgentStreamEvent = {
        type: "error",
        data: error,
        timestamp: new Date(),
      };
      events.push(event);
    };

    // Register event handlers
    this.on("message", messageHandler);
    this.on("toolCall", toolCallHandler);
    this.on("toolResult", toolResultHandler);
    this.on("error", errorHandler);

    try {
      // Execute the agent
      const executionPromise = this.execute({ ...options, stream: true });

      // Yield events as they come in
      let lastYieldedIndex = 0;
      while (true) {
        // Yield new events
        while (lastYieldedIndex < events.length) {
          yield events[lastYieldedIndex++];
        }

        // Check if execution is complete
        if (executionPromise) {
          const result = await Promise.race([
            executionPromise,
            new Promise((resolve) => setTimeout(resolve, 100)),
          ]);

          if (result) {
            // Execution complete
            yield {
              type: "complete",
              data: result,
              timestamp: new Date(),
            };
            return result as AgentExecutionResult;
          }
        }

        // Small delay to prevent busy waiting
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } finally {
      // Clean up event handlers
      this.off("message", messageHandler);
      this.off("toolCall", toolCallHandler);
      this.off("toolResult", toolResultHandler);
      this.off("error", errorHandler);
    }
  }

  /**
   * Add a new tool to the agent
   */
  addTool(tool: ToolDefinition): void {
    this.toolRegistry.register(tool);
  }

  /**
   * Remove a tool from the agent
   */
  removeTool(name: string): boolean {
    return this.toolRegistry.unregister(name);
  }

  /**
   * Get all registered tools
   */
  getTools(): ToolDefinition[] {
    return this.toolRegistry.getAll();
  }

  /**
   * Create a simple agent with common tools
   */
  static createWithCommonTools(
    config: Omit<AgentConfig, "tools"> & { tools?: ToolDefinition[] }
  ): Agent {
    const {
      thinkTool,
      calculateTool,
      memoryTool,
      concludeTool,
    } = require("./common-tools");

    const tools = [
      thinkTool,
      calculateTool,
      memoryTool,
      concludeTool,
      ...(config.tools || []),
    ];

    return new Agent({
      ...config,
      tools,
    });
  }
}
