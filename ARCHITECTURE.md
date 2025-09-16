# Tractorbeam AI Architecture

## Overview

This monorepo contains a modular AI agent framework with provider-agnostic LLM integration and standardized protocol support.

## Package Structure

### Core Packages

#### `@tractorbeamai/llm`

Provider-agnostic types and interfaces for LLM interaction.

- **Purpose**: Define common types for messages, tools, and content blocks
- **Key exports**: `BaseMessage`, `ContentBlock`, `Tool`, `BaseLLMProvider`
- **Dependencies**: Minimal (only zod for schema validation)

#### `@tractorbeamai/agents`

Agent framework for building AI agents with tool execution.

- **Purpose**: Orchestrate agent execution loops with tool calling
- **Key features**:
  - Agent builder pattern
  - Tool registry and execution
  - Message management
  - Streaming support
  - Built-in tools (think, calculate, memory, conclude)
- **Dependencies**: `@llm`, `zod`

#### `@tractorbeamai/acp`

Agent Client Protocol implementation following [zed-industries/agent-client-protocol](https://github.com/zed-industries/agent-client-protocol).

- **Purpose**: Expose agents via standardized JSON-RPC protocol
- **Key features**:
  - ACP server implementation
  - Protocol type definitions
  - Request/response handling
  - Streaming event support
- **Dependencies**: `@agents`, `@llm`

### Provider Packages

#### `@tractorbeamai/provider-anthropic`

Anthropic Claude provider implementation.

- **Purpose**: Interface with Anthropic's API
- **Models supported**: Claude 3.5 Haiku, Sonnet, Opus
- **Features**: Streaming, tool use, thinking tokens
- **Dependencies**: `@llm`, `@anthropic-ai/sdk`

## Data Flow

```
User Input → ACP Server → Agent → LLM Provider Adapter → Provider → LLM API
                ↓            ↓                                          ↓
           ACP Response ← Agent Result ← Tool Results ← LLM Response ←
```

## Key Design Decisions

### 1. Provider Abstraction

- All providers implement `BaseLLMProvider` from `@llm`
- Agents use `LlmProviderAdapter` to work with any provider
- Allows seamless provider switching without agent code changes

### 2. Message Format

- Unified `BaseMessage` type with role and content blocks
- Content blocks support text, images, documents, tool use, and results
- Compatible with OpenAI, Anthropic, and other provider formats

### 3. Tool System

- Tools defined with Zod schemas for input validation
- Handlers receive context including message history
- Support for retries, timeouts, and error handling
- Tools are provider-agnostic

### 4. Streaming

- Async generators for real-time response streaming
- Partial content blocks during generation
- Event-based architecture for UI updates

### 5. ACP Integration

- JSON-RPC 2.0 protocol implementation
- Capability negotiation
- Context management across requests
- Compatible with Zed editor and other ACP clients

## Usage Examples

### Basic Agent

```typescript
const provider = new AnthropicProvider({ apiKey });
const llmProvider = new LlmProviderAdapter(provider);

const agent = AgentBuilder.create()
  .name("Assistant")
  .llmProvider(llmProvider)
  .addCommonTools()
  .build();

const result = await agent.execute({
  initialMessages: [createUserMessage("Hello")],
});
```

### ACP Server

```typescript
const server = new AcpServer(agent);
const response = await server.handleRequest({
  jsonrpc: "2.0",
  id: 1,
  method: "execute",
  params: { messages: [...] },
});
```

## Development

### Setup

```bash
pnpm install
```

### Testing

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

### Building

```bash
pnpm build
```

## Future Enhancements

1. **Additional Providers**

   - OpenAI GPT-4
   - Google Gemini
   - Local models (Ollama)

2. **Enhanced Tools**

   - Code execution
   - Web browsing
   - Database queries
   - File system access

3. **ACP Extensions**

   - Custom protocol extensions
   - Binary data support
   - Multi-agent coordination

4. **Performance**
   - Response caching
   - Parallel tool execution
   - Token optimization

## Contributing

See individual package READMEs for specific contribution guidelines.

## License

MIT

