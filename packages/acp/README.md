# @tractorbeamai/acp

Agent Client Protocol (ACP) adapter for the @tractorbeamai/agents framework. This package wraps agents built with `@tractorbeamai/agents` to expose them via the standardized ACP protocol, enabling integration with editors like Zed, Neovim, and other ACP-compatible clients.

## Overview

The Agent Client Protocol standardizes communication between code editors and AI coding agents. This package provides:

- **ACP Server**: Wraps your agents to handle ACP protocol requests
- **ACP Client**: Connect to ACP servers programmatically
- **ACP Adapter**: High-level wrapper combining server and client capabilities
- **Full Protocol Support**: Implements the complete ACP specification

Based on the official [Agent Client Protocol](https://github.com/zed-industries/agent-client-protocol) specification.

## Installation

```bash
npm install @tractorbeamai/acp
# or
pnpm add @tractorbeamai/acp
```

## Quick Start

### Basic Usage

```typescript
import { AgentBuilder, LlmProviderAdapter } from "@tractorbeamai/agents";
import { AnthropicProvider } from "@tractorbeamai/provider-anthropic";
import { AcpAdapter } from "@tractorbeamai/acp";

// Create your agent
const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
const llmProvider = new LlmProviderAdapter(provider);

const agent = AgentBuilder.create()
  .name("MyAgent")
  .systemPrompt("You are a helpful assistant.")
  .llmProvider(llmProvider)
  .addCommonTools()
  .build();

// Wrap with ACP
const acpAdapter = new AcpAdapter(agent, {
  serverInfo: {
    name: "MyACPServer",
    version: "1.0.0",
  },
});

// Use the adapter
const result = await acpAdapter.complete([
  {
    role: "user",
    content: { type: "text", text: "Hello, how can you help?" },
  },
]);
```

### Starting an ACP Server

```typescript
import { AcpAdapter } from "@tractorbeamai/acp";

// Create adapter with your agent
const acpAdapter = new AcpAdapter(agent);

// Start server (would start HTTP/WebSocket in production)
await acpAdapter.start(3000);
console.log("ACP Server running on port 3000");

// Now compatible with:
// - Zed editor
// - Neovim (CodeCompanion)
// - marimo notebooks
// - Any ACP client
```

### Using the ACP Client

```typescript
import { AcpClient, InMemoryTransport } from "@tractorbeamai/acp";

// Create client
const transport = new InMemoryTransport(server);
const client = new AcpClient(transport);

// Initialize
await client.initialize({
  protocolVersion: "1.0.0",
  capabilities: {},
});

// List available tools
const tools = await client.listTools();

// Execute completion
const result = await client.complete({
  messages: [
    {
      role: "user",
      content: { type: "text", text: "Write a hello world function" },
    },
  ],
});
```

## Protocol Features

### Supported Methods

- **initialize**: Establish connection and exchange capabilities
- **prompts/list**: List available prompt templates
- **prompts/get**: Retrieve a specific prompt
- **tools/list**: List available tools
- **tools/call**: Execute a tool
- **completion/complete**: Main execution method

### Message Types

```typescript
// Text messages
{
  role: "user",
  content: { type: "text", text: "Your message" }
}

// Tool calls
{
  role: "assistant",
  content: {
    type: "tool_call",
    toolCallId: "call_123",
    toolName: "calculate",
    arguments: { expression: "2 + 2" }
  }
}

// Tool responses
{
  role: "assistant",
  content: {
    type: "tool_response",
    toolCallId: "call_123",
    content: [{ type: "text", text: "4" }]
  }
}
```

### Server Capabilities

```typescript
const server = new AcpServer(agent, {
  serverInfo: {
    name: "MyServer",
    version: "1.0.0",
  },
  capabilities: {
    prompts: { listChanged: true },
    tools: {
      // Tools from agent are auto-registered
    },
    experimental: {},
  },
  prompts: [
    {
      name: "code_review",
      description: "Review code for best practices",
      messages: [
        /* ... */
      ],
    },
  ],
});
```

## Integration with Editors

### Zed

Zed has built-in support for ACP agents. Your server will be automatically compatible.

### Neovim

Use with [CodeCompanion.nvim](https://github.com/olimorris/codecompanion.nvim):

```lua
require("codecompanion").setup({
  adapters = {
    my_agent = {
      schema = "acp",
      url = "http://localhost:3000",
    },
  },
})
```

### Custom Clients

Implement the ACP protocol to connect from any application:

```typescript
// Send JSON-RPC requests
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "completion/complete",
  "params": {
    "messages": [/* ... */]
  }
}
```

## Advanced Usage

### Custom Prompts

```typescript
const acpAdapter = new AcpAdapter(agent, {
  prompts: [
    {
      name: "refactor",
      description: "Refactor code for clarity",
      messages: [
        {
          role: "system",
          content: {
            type: "text",
            text: "You are a refactoring expert...",
          },
        },
      ],
    },
  ],
});
```

### Event Handling

```typescript
const server = acpAdapter.getServer();

server.on("start", (port) => {
  console.log(`Server started on port ${port}`);
});

server.on("notification", (notification) => {
  console.log("Notification:", notification);
});
```

### Custom Transport

```typescript
import { AcpClient, AcpTransport } from "@tractorbeamai/acp";

class WebSocketTransport extends EventEmitter implements AcpTransport {
  async send(request: AcpRequest): Promise<void> {
    // WebSocket implementation
  }

  async close(): Promise<void> {
    // Cleanup
  }
}

const client = new AcpClient(new WebSocketTransport());
```

## Examples

See the `examples/` directory for complete examples:

- `acp-usage.ts`: Complete usage examples
- Integration with different LLM providers
- Custom prompt templates
- Tool registration and execution

## API Reference

### AcpAdapter

Main adapter class that wraps an agent:

```typescript
new AcpAdapter(agent: Agent, options?: AcpServerOptions)
  .getServer(): AcpServer
  .createLocalClient(): AcpClient
  .complete(messages): Promise<CompleteResult>
  .start(port?: number): Promise<void>
  .stop(): Promise<void>
```

### AcpServer

Handles ACP protocol requests:

```typescript
new AcpServer(agent: Agent, options?: AcpServerOptions)
  .handleRequest(request: AcpRequest): Promise<AcpResponse>
  .sendNotification(notification: AcpNotification): void
  .start(port?: number): Promise<void>
  .stop(): Promise<void>
```

### AcpClient

Connects to ACP servers:

```typescript
new AcpClient(transport: AcpTransport, options?: AcpClientOptions)
  .initialize(params): Promise<InitializeResult>
  .listPrompts(): Promise<ListPromptsResult>
  .getPrompt(params): Promise<GetPromptResult>
  .listTools(): Promise<ListToolsResult>
  .callTool(params): Promise<CallToolResult>
  .complete(params): Promise<CompleteResult>
  .close(): Promise<void>
```

## Compatibility

This implementation follows the official ACP specification and is compatible with:

- [claude-code-acp](https://github.com/zed-industries/claude-code-acp)
- [agent-client-protocol](https://github.com/zed-industries/agent-client-protocol)
- Zed editor
- Neovim (via plugins)
- marimo notebooks
- Any ACP-compliant client

## Contributing

Contributions welcome! Please ensure:

1. Follow the ACP specification
2. Add tests for new features
3. Update documentation
4. Maintain compatibility

## License

MIT

## References

- [Agent Client Protocol Specification](https://github.com/zed-industries/agent-client-protocol)
- [Claude Code ACP Implementation](https://github.com/zed-industries/claude-code-acp)
- [ACP Website](https://agentclientprotocol.com)
