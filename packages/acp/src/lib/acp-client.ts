import { EventEmitter } from "events";
import type {
  AcpRequest,
  AcpResponse,
  AcpNotification,
  InitializeParams,
  InitializeResult,
  ListPromptsResult,
  GetPromptParams,
  GetPromptResult,
  ListToolsResult,
  CallToolParams,
  CallToolResult,
  CompleteParams,
  CompleteResult,
} from "./acp-types.js";

export interface AcpClientOptions {
  timeout?: number;
}

export class AcpClient extends EventEmitter {
  private nextId = 1;
  private pendingRequests = new Map<
    string | number,
    {
      resolve: (response: AcpResponse) => void;
      reject: (error: Error) => void;
      timeout?: NodeJS.Timeout;
    }
  >();
  private timeout: number;
  private initialized = false;

  constructor(private transport: AcpTransport, options: AcpClientOptions = {}) {
    super();
    this.timeout = options.timeout ?? 30000;

    // Set up transport listeners
    transport.on("response", (response: AcpResponse) => {
      this.handleResponse(response);
    });

    transport.on("notification", (notification: AcpNotification) => {
      this.handleNotification(notification);
    });
  }

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    if (this.initialized) {
      throw new Error("Client already initialized");
    }

    const response = await this.sendRequest("initialize", params);
    this.initialized = true;
    return response.result as InitializeResult;
  }

  async listPrompts(): Promise<ListPromptsResult> {
    this.ensureInitialized();
    const response = await this.sendRequest("prompts/list", {});
    return response.result as ListPromptsResult;
  }

  async getPrompt(params: GetPromptParams): Promise<GetPromptResult> {
    this.ensureInitialized();
    const response = await this.sendRequest("prompts/get", params);
    return response.result as GetPromptResult;
  }

  async listTools(): Promise<ListToolsResult> {
    this.ensureInitialized();
    const response = await this.sendRequest("tools/list", {});
    return response.result as ListToolsResult;
  }

  async callTool(params: CallToolParams): Promise<CallToolResult> {
    this.ensureInitialized();
    const response = await this.sendRequest("tools/call", params);
    return response.result as CallToolResult;
  }

  async complete(params: CompleteParams): Promise<CompleteResult> {
    this.ensureInitialized();
    const response = await this.sendRequest("completion/complete", params);
    return response.result as CompleteResult;
  }

  private async sendRequest(
    method: string,
    params: unknown
  ): Promise<AcpResponse> {
    const id = this.nextId++;
    const request: AcpRequest = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${id} timed out`));
      }, this.timeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.transport.send(request).catch((error) => {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }

  private handleResponse(response: AcpResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.id);
    if (pending.timeout) {
      clearTimeout(pending.timeout);
    }

    if (response.error) {
      pending.reject(
        new Error(`ACP Error ${response.error.code}: ${response.error.message}`)
      );
    } else {
      pending.resolve(response);
    }
  }

  private handleNotification(notification: AcpNotification): void {
    this.emit("notification", notification);

    // Emit specific events for known notification types
    if (notification.method === "notifications/progress") {
      this.emit("progress", notification.params);
    } else if (notification.method === "notifications/log") {
      this.emit("log", notification.params);
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
  }

  async close(): Promise<void> {
    // Clear all pending requests
    for (const [id, pending] of this.pendingRequests) {
      if (pending.timeout) {
        clearTimeout(pending.timeout);
      }
      pending.reject(new Error("Client closed"));
    }
    this.pendingRequests.clear();

    await this.transport.close();
  }
}

// Transport interface for different communication methods
export interface AcpTransport extends EventEmitter {
  send(request: AcpRequest): Promise<void>;
  close(): Promise<void>;
}

// Simple in-memory transport for testing
export class InMemoryTransport extends EventEmitter implements AcpTransport {
  constructor(
    private server: {
      handleRequest: (request: AcpRequest) => Promise<AcpResponse>;
    }
  ) {
    super();
  }

  async send(request: AcpRequest): Promise<void> {
    // Simulate async communication
    setImmediate(async () => {
      try {
        const response = await this.server.handleRequest(request);
        this.emit("response", response);
      } catch (error) {
        this.emit("response", {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : "Internal error",
          },
        });
      }
    });
  }

  async close(): Promise<void> {
    // Nothing to clean up for in-memory transport
  }
}
