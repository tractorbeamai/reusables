import { AgentBuilder, LlmProviderAdapter } from "@tractorbeamai/agents";
import { AnthropicProvider } from "@tractorbeamai/provider-anthropic";
import { AcpAdapter } from "../src";
import type { CompleteParams } from "../src";

/**
 * Example: Using ACP to wrap an agent and expose it via the protocol
 */
async function acpExample() {
  // Step 1: Create your agent as usual
  const anthropicProvider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-3-5-haiku-latest",
  });

  const llmProvider = new LlmProviderAdapter(anthropicProvider);

  const agent = AgentBuilder.create()
    .name("AcpAgent")
    .systemPrompt("You are a helpful coding assistant.")
    .llmProvider(llmProvider)
    .addCommonTools()
    .build();

  // Step 2: Wrap the agent with ACP
  const acpAdapter = new AcpAdapter(agent, {
    serverInfo: {
      name: "MyACPServer",
      version: "1.0.0",
    },
    prompts: [
      {
        name: "code_review",
        description: "Review code for best practices",
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: "You are a code reviewer. Analyze the provided code for best practices, potential bugs, and improvements.",
            },
          },
        ],
      },
      {
        name: "refactor",
        description: "Suggest refactoring improvements",
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: "You are a refactoring expert. Suggest improvements to make the code cleaner and more maintainable.",
            },
          },
        ],
      },
    ],
  });

  // Step 3: Use the ACP server
  const server = acpAdapter.getServer();

  // Handle a raw ACP request
  const initResponse = await server.handleRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "1.0.0",
      capabilities: {},
      clientInfo: {
        name: "ExampleClient",
        version: "1.0.0",
      },
    },
  });
  console.log("Initialize response:", initResponse);

  // List available prompts
  const promptsResponse = await server.handleRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "prompts/list",
    params: {},
  });
  console.log("Available prompts:", promptsResponse);

  // Execute a completion
  const completeResponse = await server.handleRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "completion/complete",
    params: {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Write a function to calculate fibonacci numbers",
          },
        },
      ],
    } as CompleteParams,
  });
  console.log("Completion response:", completeResponse);

  // Step 4: Use the convenience client
  const client = acpAdapter.createLocalClient();

  await client.initialize({
    protocolVersion: "1.0.0",
    capabilities: {},
  });

  // List tools
  const tools = await client.listTools();
  console.log("Available tools:", tools);

  // Call a tool
  const toolResult = await client.callTool({
    name: "calculate",
    arguments: { expression: "2 + 2" },
  });
  console.log("Tool result:", toolResult);

  // Complete with tool use
  const result = await client.complete({
    messages: [
      {
        role: "user",
        content: { type: "text", text: "What is 15 * 37?" },
      },
    ],
  });
  console.log("Completion with tools:", result);
}

/**
 * Example: Starting an ACP server for external clients
 */
async function acpServerExample() {
  // Create agent
  const anthropicProvider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const llmProvider = new LlmProviderAdapter(anthropicProvider);

  const agent = AgentBuilder.create()
    .name("ProductionAgent")
    .systemPrompt("You are a production-ready AI assistant.")
    .llmProvider(llmProvider)
    .addCommonTools()
    .build();

  // Create ACP adapter
  const acpAdapter = new AcpAdapter(agent);

  // Start server (would start HTTP/WebSocket server in real implementation)
  await acpAdapter.start(3000);
  console.log("ACP Server started on port 3000");

  // Server is now ready to accept ACP protocol requests from:
  // - Zed editor
  // - Neovim (via CodeCompanion)
  // - marimo notebooks
  // - Any ACP-compatible client

  // Handle shutdown gracefully
  process.on("SIGINT", async () => {
    console.log("Shutting down ACP server...");
    await acpAdapter.stop();
    process.exit(0);
  });
}

// Run examples
async function main() {
  console.log("=== ACP Adapter Example ===\n");
  await acpExample();

  console.log("\n=== ACP Server Example ===\n");
  await acpServerExample();
}

if (require.main === module) {
  main().catch(console.error);
}

export { acpExample, acpServerExample };
