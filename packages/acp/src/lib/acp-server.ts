// Agent type from @tractorbeamai/agents
import type { BaseMessage, ContentBlock } from "@tractorbeamai/llm";
import { EventEmitter } from "events";
import {
  type AcpRequest,
  type AcpResponse,
  type AcpNotification,
  type InitializeParams,
  type InitializeResult,
  type ServerCapabilities,
  type ListPromptsResult,
  type GetPromptParams,
  type GetPromptResult,
  type ListToolsResult,
  type CallToolParams,
  type CallToolResult,
  type CompleteParams,
  type CompleteResult,
  type CompletionMessage,
  type TextContent,
  type ToolCallContent,
  ERROR_CODES,
} from "./acp-types.js";

export interface AcpServerOptions {
  serverInfo?: {
    name: string;
    version?: string;
  };
  capabilities?: ServerCapabilities;
  prompts?: Array<{
    name: string;
    description?: string;
    messages: CompletionMessage[];
  }>;
}

export class AcpServer extends EventEmitter {
  private agent: any; // Agent type from @tractorbeamai/agents
  private serverInfo: { name: string; version?: string };
  private capabilities: ServerCapabilities;
  private prompts: Map<
    string,
    { description?: string; messages: CompletionMessage[] }
  >;
  private initialized = false;

  constructor(agent: any, options: AcpServerOptions = {}) {
    super();
    this.agent = agent;
    this.serverInfo = options.serverInfo ?? {
      name: "@tractorbeamai/acp-server",
      version: "1.0.0",
    };

    // Build capabilities from agent tools
    const tools: Record<string, any> = {};
    for (const tool of agent.getTools() as any[]) {
      tools[tool.name] = {
        description: tool.description,
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      };
    }

    this.capabilities = options.capabilities ?? {
      prompts: { listChanged: true },
      tools,
      experimental: {},
    };

    this.prompts = new Map(
      options.prompts?.map((p) => [
        p.name,
        { description: p.description, messages: p.messages as any },
      ]) ?? []
    );
  }

  async handleRequest(request: AcpRequest): Promise<AcpResponse> {
    try {
      switch (request.method) {
        case "initialize":
          return this.handleInitialize(request);
        case "prompts/list":
          return this.handleListPrompts(request);
        case "prompts/get":
          return this.handleGetPrompt(request);
        case "tools/list":
          return this.handleListTools(request);
        case "tools/call":
          return this.handleCallTool(request);
        case "completion/complete":
          return this.handleComplete(request);
        default:
          return this.createErrorResponse(
            request.id,
            ERROR_CODES.METHOD_NOT_FOUND,
            `Unknown method: ${request.method}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        ERROR_CODES.INTERNAL_ERROR,
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  }

  private handleInitialize(request: AcpRequest): AcpResponse {
    const params = request.params as InitializeParams;

    if (this.initialized) {
      return this.createErrorResponse(
        request.id,
        ERROR_CODES.INVALID_REQUEST,
        "Server already initialized"
      );
    }

    this.initialized = true;

    const result: InitializeResult = {
      protocolVersion: params.protocolVersion ?? "1.0.0",
      capabilities: this.capabilities,
      serverInfo: this.serverInfo,
    };

    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  }

  private handleListPrompts(request: AcpRequest): AcpResponse {
    const result: ListPromptsResult = {
      prompts: Array.from(this.prompts.entries()).map(([name, prompt]) => ({
        name,
        description: prompt.description,
      })),
    };

    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  }

  private handleGetPrompt(request: AcpRequest): AcpResponse {
    const params = request.params as GetPromptParams;
    const prompt = this.prompts.get(params.name);

    if (!prompt) {
      return this.createErrorResponse(
        request.id,
        ERROR_CODES.INVALID_PARAMS,
        `Prompt not found: ${params.name}`
      );
    }

    const result: GetPromptResult = {
      messages: prompt.messages as any,
    };

    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  }

  private handleListTools(request: AcpRequest): AcpResponse {
    const tools = this.agent.getTools();

    const result: ListToolsResult = {
      tools: tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      })),
    };

    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  }

  private async handleCallTool(request: AcpRequest): Promise<AcpResponse> {
    const params = request.params as CallToolParams;
    const tools = this.agent.getTools();
    const tool = tools.find((t: any) => t.name === params.name);

    if (!tool) {
      return this.createErrorResponse(
        request.id,
        ERROR_CODES.INVALID_PARAMS,
        `Tool not found: ${params.name}`
      );
    }

    try {
      const toolResult = await tool.handler(params.arguments ?? {}, {
        messages: [],
        metadata: {},
      });

      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text: toolResult.success
              ? JSON.stringify(toolResult.data)
              : toolResult.error ?? "Tool execution failed",
          },
        ],
        isError: !toolResult.success,
      };

      return {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    } catch (error) {
      const result: CallToolResult = {
        content: [
          {
            type: "text",
            text:
              error instanceof Error ? error.message : "Tool execution failed",
          },
        ],
        isError: true,
      };

      return {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    }
  }

  private async handleComplete(request: AcpRequest): Promise<AcpResponse> {
    const params = request.params as CompleteParams;

    // Convert ACP messages to agent messages
    const messages = this.convertAcpMessages(params.messages);

    // Execute the agent
    const result = await this.agent.execute({
      initialMessages: messages,
      metadata: params.metadata,
    });

    // Get the last assistant message
    const lastMessage = result.messages
      .filter((m: any) => m.role === "assistant")
      .pop();

    if (!lastMessage) {
      return this.createErrorResponse(
        request.id,
        ERROR_CODES.INTERNAL_ERROR,
        "No response generated"
      );
    }

    // Convert to ACP format
    const completionContent = this.convertToAcpContent(lastMessage);

    const completeResult: CompleteResult = {
      completion: {
        role: "assistant",
        content: completionContent,
      },
      stopReason: "endTurn",
    };

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: completeResult,
    };
  }

  private convertAcpMessages(messages: CompletionMessage[]): BaseMessage[] {
    return messages.map((msg) => {
      const content: ContentBlock[] = [];

      if (msg.content.type === "text") {
        content.push({ type: "text", text: msg.content.text });
      } else if (msg.content.type === "tool_call") {
        content.push({
          type: "toolUse",
          id: msg.content.toolCallId,
          name: msg.content.toolName,
          input: msg.content.arguments,
        });
      } else if (msg.content.type === "tool_response") {
        const text = msg.content.content
          .map((c: any) => (c.type === "text" ? c.text : JSON.stringify(c)))
          .join("\n");
        content.push({
          type: "toolResult",
          toolUseId: msg.content.toolCallId,
          content: text,
          isError: msg.content.isError,
        });
      }

      return {
        role: msg.role,
        content,
      };
    });
  }

  private convertToAcpContent(message: BaseMessage): any {
    const contents: Array<TextContent | ToolCallContent> = [];

    for (const block of message.content) {
      if (typeof block === "string") {
        contents.push({ type: "text", text: block });
      } else if (block.type === "text") {
        contents.push({ type: "text", text: block.text });
      } else if (block.type === "toolUse") {
        contents.push({
          type: "tool_call",
          toolCallId: block.id,
          toolName: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return contents.length === 1 ? contents[0] : contents;
  }

  private createErrorResponse(
    id: string | number,
    code: number,
    message: string
  ): AcpResponse {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code,
        message,
      },
    };
  }

  sendNotification(notification: AcpNotification): void {
    this.emit("notification", notification);
  }

  async start(port?: number): Promise<void> {
    // This would start an HTTP/WebSocket server
    // For now, this is a placeholder for the actual server implementation
    this.emit("start", port ?? 3000);
  }

  async stop(): Promise<void> {
    this.emit("stop");
  }
}
