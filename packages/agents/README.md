# @tractorbeamai/agents

A flexible, agent-agnostic TypeScript framework for building AI agents with arbitrary tool calls, prompts, and message handling. Inspired by the [Agent Client Protocol](https://github.com/zed-industries/agent-client-protocol) but designed to be general-purpose for any scenario.

## Features

- 🔧 **Flexible Tool System**: Define and register custom tools with Zod schema validation
- 🔄 **Agent Loop**: Robust execution loop with configurable iteration limits
- 📨 **Message Management**: Comprehensive message tracking and formatting
- 🌊 **Streaming Support**: Real-time event streaming for responsive UIs
- 🏗️ **Builder Pattern**: Intuitive agent configuration with fluent API
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🔌 **LLM Agnostic**: Works with any LLM provider through a simple interface

## Installation

```bash
npm install @tractorbeamai/agents
# or
pnpm add @tractorbeamai/agents
```

## Quick Start

```typescript
import { AgentBuilder, MessageManager } from "@tractorbeamai/agents";

// Create an agent with common tools
const agent = AgentBuilder.create()
  .name("MyAssistant")
  .systemPrompt("You are a helpful assistant.")
  .llmProvider(myLLMProvider) // Your LLM provider from @tractorbeamai/llm
  .addCommonTools() // Adds think, calculate, memory, conclude tools
  .build();

// Execute the agent
const result = await agent.execute({
  initialMessages: [MessageManager.createUserMessage("What is 2 + 2?")],
});
```

## Core Concepts

### Tools

Tools are functions that agents can call to perform actions or retrieve information:

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
  handler: async (input) => {
    // Your implementation
    return { temperature: 22, condition: "sunny" };
  },
});
```

### Messages

The system uses a flexible message format compatible with OpenAI/Anthropic APIs:

```typescript
interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | MessageContent | MessageContent[];
}
```

### Agent Configuration

Use the builder pattern for easy configuration:

```typescript
const agent = AgentBuilder.create()
  .name("DocumentAnalyzer")
  .description("Analyzes documents for compliance")
  .systemPrompt("You are a document analysis expert...")
  .maxIterations(20)
  .addTool(customTool)
  .onMessage((message) => console.log("New message:", message))
  .onToolCall((name, input, result) => console.log(`Tool ${name} called`))
  .onError((error) => console.error("Error:", error))
  .llmProvider(llmProvider)
  .build();
```

## Common Tools

The framework includes several built-in tools:

- **think**: Internal reasoning and planning
- **calculate**: Mathematical calculations
- **memory**: Store and retrieve information during execution
- **conclude**: Make final decisions with confidence levels

## Streaming

For real-time updates, use the streaming API:

```typescript
const stream = agent.stream({
  initialMessages: [userMessage],
});

for await (const event of stream) {
  console.log(`[${event.type}]`, event.data);
  // Handle: 'message', 'tool_call', 'tool_result', 'error', 'complete'
}
```

## Advanced Usage

### Custom Tool with Validation

```typescript
const analysisStool = createTool({
  name: "analyze_data",
  description: "Perform data analysis",
  inputSchema: z.object({
    data: z.array(z.number()),
    method: z.enum(["mean", "median", "std"]),
    options: z
      .object({
        precision: z.number().optional(),
      })
      .optional(),
  }),
  handler: async (input, context) => {
    // Access conversation history
    const messages = context.messages;

    // Access metadata
    const metadata = context.metadata;

    // Perform analysis
    return calculateStats(input.data, input.method);
  },
});
```

### Tool Registry

Manage tools dynamically:

```typescript
// Add tool at runtime
agent.addTool(newTool);

// Remove tool
agent.removeTool("tool_name");

// Get all tools
const tools = agent.getTools();
```

### Message Management

```typescript
const manager = new MessageManager();

// Add messages
manager.addMessage(MessageManager.createUserMessage("Hello"));
manager.addMessage(MessageManager.createAssistantMessage("Hi there!"));

// Query messages
const userMessages = manager.getMessagesByRole("user");
const lastMessage = manager.getLastMessage();

// Extract tool calls
const toolCalls = MessageManager.extractToolCalls(message);

// Format for display
console.log(MessageManager.formatForDisplay(message));
```

## Examples

See the `examples/` directory for complete examples:

- `basic-usage.ts`: Simple agent with common tools
- `document-analysis-agent.ts`: Complex document compliance checking

## API Reference

### AgentBuilder

- `.name(name: string)`: Set agent name
- `.description(desc: string)`: Set agent description
- `.systemPrompt(prompt: string)`: Set system prompt
- `.llmProvider(provider: LLMProvider)`: Set LLM provider
- `.maxIterations(max: number)`: Set max iterations
- `.addTool(tool: ToolDefinition)`: Add a tool
- `.addTools(tools: ToolDefinition[])`: Add multiple tools
- `.addCommonTools()`: Add built-in tools
- `.onMessage(handler)`: Set message handler
- `.onToolCall(handler)`: Set tool call handler
- `.onError(handler)`: Set error handler
- `.build()`: Build the agent

### Agent

- `.execute(options)`: Execute the agent
- `.stream(options)`: Execute with streaming
- `.addTool(tool)`: Add tool dynamically
- `.removeTool(name)`: Remove tool
- `.getTools()`: Get all tools

### MessageManager

- `.addMessage(message)`: Add a message
- `.getMessages()`: Get all messages
- `.getMessagesByRole(role)`: Filter by role
- `.getLastMessage()`: Get last message
- `.clear()`: Clear all messages

## License

MIT
