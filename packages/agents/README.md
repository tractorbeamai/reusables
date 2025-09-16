# @tractorbeamai/agents

A flexible, agent-agnostic TypeScript framework for building AI agents with tool execution, message handling, and LLM provider integration.

## Architecture Overview

This package is part of a modular AI agent ecosystem:

```
┌─────────────────────────────────────────────────────────┐
│                     Applications                         │
│            (Editors, IDEs, Custom Apps)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              @tractorbeamai/acp                         │
│         (Agent Client Protocol Server)                   │
│    Standardized API following zed-industries/ACP        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            @tractorbeamai/agents                        │
│         (Agent Framework - This Package)                 │
│   • Agent execution loop                                 │
│   • Tool registry & execution                           │
│   • Message management                                   │
│   • Streaming support                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              @tractorbeamai/llm                         │
│         (Provider Abstraction Layer)                     │
│   • Common types (messages, tools, content blocks)      │
│   • Base provider interface                              │
│   • Streaming protocols                                  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬─────────────┐
        │                         │             │
┌───────▼──────┐  ┌───────────────▼──┐  ┌──────▼──────┐
│  @provider-  │  │    @provider-    │  │  @provider- │
│  anthropic   │  │     openai       │  │   gemini    │
└──────────────┘  └──────────────────┘  └─────────────┘
```

## Installation

```bash
npm install @tractorbeamai/agents @tractorbeamai/llm @tractorbeamai/provider-anthropic
# or
pnpm add @tractorbeamai/agents @tractorbeamai/llm @tractorbeamai/provider-anthropic
```

## Quick Start

```typescript
import {
  AgentBuilder,
  MessageManager,
  LlmProviderAdapter,
} from "@tractorbeamai/agents";
import { AnthropicProvider } from "@tractorbeamai/provider-anthropic";

// Create a provider and adapt it for agents
const anthropicProvider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-3-5-haiku-latest",
});
const llmProvider = new LlmProviderAdapter(anthropicProvider);

// Build an agent with built-in tools
const agent = AgentBuilder.create()
  .name("MyAssistant")
  .systemPrompt("You are a helpful assistant.")
  .llmProvider(llmProvider)
  .addCommonTools() // Adds think, calculate, memory, conclude
  .build();

// Execute the agent
const result = await agent.execute({
  initialMessages: [MessageManager.createUserMessage("What is 2 + 2?")],
});

console.log("Result:", result.messages[result.messages.length - 1]);
```

## Core Concepts

### Agents

Agents orchestrate the execution loop between LLMs and tools:

```typescript
const agent = new Agent({
  name: "DataAnalyst",
  systemPrompt: "You analyze data and provide insights.",
  llmProvider: myProvider,
  tools: [analysisTool, visualizationTool],
  maxIterations: 20,
});
```

### Tools

Tools are functions that agents can execute to perform actions:

```typescript
import { createTool } from "@tractorbeamai/agents";
import { z } from "zod";

const weatherTool = createTool({
  name: "get_weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(["celsius", "fahrenheit"]),
  }),
  handler: async (input, context) => {
    const response = await fetchWeather(input.location, input.units);
    return response;
  },
});
```

### Messages

Messages follow a unified format compatible across providers:

```typescript
interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: ContentBlock[];
}

// Content blocks can be text, tool use, or tool results
type ContentBlock =
  | { type: "text"; text: string }
  | { type: "toolUse"; id: string; name: string; input: unknown }
  | { type: "toolResult"; toolUseId: string; content: string | object };
```

### Provider Integration

The `LlmProviderAdapter` bridges any `@llm` provider to the agent framework:

```typescript
// Use any provider from the @llm ecosystem
import { OpenAIProvider } from "@tractorbeamai/provider-openai";
import { GeminiProvider } from "@tractorbeamai/provider-gemini";

const openaiAdapter = new LlmProviderAdapter(new OpenAIProvider(config));
const geminiAdapter = new LlmProviderAdapter(new GeminiProvider(config));

// Switch providers without changing agent code
agent.llmProvider = openaiAdapter;
```

## Built-in Tools

The framework includes several utility tools:

### Think Tool

Internal reasoning and planning:

```typescript
{
  name: "think",
  description: "Reason through a problem or plan approach",
  input: { thought: string }
}
```

### Calculate Tool

Mathematical computations:

```typescript
{
  name: "calculate",
  description: "Perform mathematical calculations",
  input: { expression: string }
}
```

### Memory Tool

Persistent storage during execution:

```typescript
{
  name: "memory",
  description: "Store and retrieve information",
  input: {
    action: "store" | "retrieve" | "list",
    key?: string,
    value?: unknown
  }
}
```

### Conclude Tool

Final decisions with confidence:

```typescript
{
  name: "conclude",
  description: "Make a final decision",
  input: {
    decision: string,
    confidence: number, // 0-1
    reasoning?: string
  }
}
```

## Streaming

Real-time streaming for responsive UIs:

```typescript
const stream = agent.stream({
  initialMessages: [userMessage],
});

for await (const event of stream) {
  switch (event.type) {
    case "message":
      console.log("New message:", event.data);
      break;
    case "tool_call":
      console.log("Calling tool:", event.data);
      break;
    case "tool_result":
      console.log("Tool result:", event.data);
      break;
    case "complete":
      console.log("Execution complete");
      break;
  }
}
```

## Advanced Usage

### Custom Tool Registry

```typescript
import { ToolRegistry } from "@tractorbeamai/agents";

const registry = new ToolRegistry();
registry.register(customTool);
registry.registerMany([tool1, tool2, tool3]);

// Dynamic tool management
agent.addTool(newTool);
agent.removeTool("tool_name");
const tools = agent.getTools();
```

### Message Management

```typescript
const manager = new MessageManager();

// Build conversation
manager.addMessage(MessageManager.createSystemMessage("You are helpful"));
manager.addMessage(MessageManager.createUserMessage("Hello"));
manager.addMessage(MessageManager.createAssistantMessage("Hi there!"));

// Query messages
const userMessages = manager.getMessagesByRole("user");
const lastMessage = manager.getLastMessage();
const stats = manager.getStats(); // tokens, tool calls, etc.

// Extract tool calls
const toolCalls = MessageManager.extractToolCalls(assistantMessage);
```

### Error Handling

```typescript
const agent = AgentBuilder.create()
  .name("RobustAgent")
  .llmProvider(provider)
  .onError((error) => {
    console.error("Agent error:", error);
    // Custom error handling
  })
  .build();

// Tools can also handle errors
const safeTool = createTool({
  name: "safe_operation",
  handler: async (input) => {
    try {
      return await riskyOperation(input);
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
```

## ACP Integration

Expose agents via the Agent Client Protocol:

```typescript
import { AcpServer } from "@tractorbeamai/acp";

const server = new AcpServer(agent, {
  capabilities: {
    tools: true,
    streaming: true,
    contextManagement: true,
  },
});

// Handle ACP requests
const response = await server.handleRequest({
  jsonrpc: "2.0",
  id: 1,
  method: "execute",
  params: { messages: [...] },
});
```

## Examples

See the `examples/` directory for complete implementations:

- `basic-usage.ts` - Simple agent with common tools
- `document-analysis-agent.ts` - Complex document processing
- `streaming-example.ts` - Real-time streaming responses
- `custom-tools.ts` - Building custom tools
- `multi-provider.ts` - Switching between LLM providers

## API Reference

### AgentBuilder

Fluent API for agent configuration:

```typescript
AgentBuilder.create()
  .name(string)              // Agent identifier
  .description(string)        // Agent purpose
  .systemPrompt(string)       // System instructions
  .llmProvider(LLMProvider)   // LLM provider instance
  .maxIterations(number)      // Max execution cycles
  .addTool(ToolDefinition)    // Add single tool
  .addTools(ToolDefinition[]) // Add multiple tools
  .addCommonTools()           // Add built-in tools
  .onMessage(handler)         // Message callback
  .onToolCall(handler)        // Tool execution callback
  .onError(handler)           // Error callback
  .build()                    // Create agent instance
```

### Agent Methods

```typescript
agent.execute(options); // Run agent to completion
agent.stream(options); // Stream execution events
agent.addTool(tool); // Add tool at runtime
agent.removeTool(name); // Remove tool
agent.getTools(); // List all tools
```

### MessageManager

```typescript
manager.addMessage(message); // Add to conversation
manager.getMessages(); // Get all messages
manager.getMessagesByRole(role); // Filter by role
manager.getLastMessage(); // Get most recent
manager.getLastNMessages(n); // Get last N
manager.clear(); // Clear history
manager.onMessage(listener); // Message listener
MessageManager.createUserMessage(text); // Helper constructors
MessageManager.extractToolCalls(msg); // Parse tool calls
MessageManager.formatForDisplay(msg); // Human-readable format
```

## Contributing

Contributions welcome! Please ensure:

1. Tests pass: `pnpm test`
2. Linting passes: `pnpm lint`
3. Types are properly defined
4. Documentation is updated

## License

MIT

## Related Packages

- [@tractorbeamai/llm](../llm) - Provider abstraction layer
- [@tractorbeamai/provider-anthropic](../provider-anthropic) - Anthropic/Claude provider
- [@tractorbeamai/acp](../acp) - Agent Client Protocol server

## References

- [Agent Client Protocol](https://github.com/zed-industries/agent-client-protocol) - Protocol specification
- [Examples](./examples) - Complete usage examples
