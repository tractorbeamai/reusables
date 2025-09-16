// ACP Protocol Types - Following the official Agent Client Protocol specification
// Reference: https://github.com/zed-industries/agent-client-protocol

export interface AcpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: unknown;
}

export interface AcpResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: AcpError;
}

export interface AcpError {
  code: number;
  message: string;
  data?: unknown;
}

export interface AcpNotification {
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
}

// Initialize method
export interface InitializeParams {
  protocolVersion: string;
  capabilities: ClientCapabilities;
  clientInfo?: {
    name: string;
    version?: string;
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: {
    name: string;
    version?: string;
  };
}

export interface ClientCapabilities {
  experimental?: Record<string, unknown>;
}

export interface ServerCapabilities {
  prompts?: PromptsCapability;
  tools?: Record<string, ToolDeclaration>;
  logging?: Record<string, unknown>;
  experimental?: Record<string, unknown>;
}

export interface PromptsCapability {
  listChanged?: boolean;
}

export interface ToolDeclaration {
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

// Prompts
export interface ListPromptsParams {}

export interface ListPromptsResult {
  prompts: PromptInfo[];
}

export interface PromptInfo {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface GetPromptParams {
  name: string;
  arguments?: Record<string, string>;
}

export interface GetPromptResult {
  messages: PromptMessage[];
}

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: TextContent | ImageContent | EmbeddedResource;
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
}

export interface EmbeddedResource {
  type: "resource";
  resource: Resource;
}

export interface Resource {
  uri: string;
  text?: string;
  mimeType?: string;
}

// Tools
export interface ListToolsParams {}

export interface ListToolsResult {
  tools: ToolInfo[];
}

export interface ToolInfo {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export interface CallToolParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface CallToolResult {
  content: Array<TextContent | ImageContent | EmbeddedResource>;
  isError?: boolean;
}

// Completion (main execution method)
export interface CompleteParams {
  messages: CompletionMessage[];
  includeContext?: "none" | "thisServer" | "allServers";
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

export interface CompletionMessage {
  role: "system" | "user" | "assistant";
  content: TextContent | ImageContent | ToolCallContent | ToolResponseContent;
}

export interface ToolCallContent {
  type: "tool_call";
  toolCallId: string;
  toolName: string;
  arguments?: Record<string, unknown>;
}

export interface ToolResponseContent {
  type: "tool_response";
  toolCallId: string;
  content: Array<TextContent | ImageContent | EmbeddedResource>;
  isError?: boolean;
}

export interface CompleteResult {
  completion: {
    role: "assistant";
    content: TextContent | Array<TextContent | ToolCallContent>;
  };
  stopReason?: "endTurn" | "stopSequence" | "maxTokens";
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Notifications
export interface ProgressNotification {
  jsonrpc: "2.0";
  method: "notifications/progress";
  params: {
    progressToken: string | number;
    progress: number;
    total?: number;
  };
}

export interface LogMessageNotification {
  jsonrpc: "2.0";
  method: "notifications/log";
  params: {
    level: "debug" | "info" | "warning" | "error";
    message: string;
    data?: unknown;
  };
}

// Errors
export const ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;
