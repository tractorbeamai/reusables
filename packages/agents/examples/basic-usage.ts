import { AgentBuilder, MessageManager, LlmProviderAdapter } from "../src";
import { AnthropicProvider } from "@tractorbeamai/provider-anthropic";
import { z } from "zod";

/**
 * Example 1: Basic agent with Anthropic provider
 */
async function basicAgentWithAnthropic() {
  // Create Anthropic provider
  const anthropicProvider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-3-5-haiku-latest",
  });

  // Wrap it for use with agents
  const llmProvider = new LlmProviderAdapter(anthropicProvider);

  // Build the agent
  const agent = AgentBuilder.create()
    .name("MathAssistant")
    .description("An agent that can perform calculations")
    .systemPrompt("You are a helpful math assistant.")
    .llmProvider(llmProvider)
    .addCommonTools()
    .maxIterations(10)
    .onMessage((message) => {
      console.log("Message:", MessageManager.formatForDisplay(message));
    })
    .onToolCall((toolName, input, result) => {
      console.log(`Tool ${toolName} called:`, input, "Result:", result);
    })
    .build();

  // Execute the agent
  const result = await agent.execute({
    initialMessages: [MessageManager.createUserMessage("What is 2 + 2?")],
  });

  console.log("Execution complete!");
  console.log("Total iterations:", result.iterations);
  console.log("Final message:", result.messages[result.messages.length - 1]);
}

/**
 * Example 2: Custom tool implementation
 */
async function customToolExample() {
  const { createTool } = await import("../src");

  // Create a custom weather tool
  const weatherTool = createTool({
    name: "get_weather",
    description: "Get current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("City name"),
      units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    }),
    handler: async (input) => {
      // Simulate API call
      console.log(`Getting weather for ${input.location}...`);

      // Mock response
      const temp = input.units === "celsius" ? 22 : 72;
      return {
        temperature: temp,
        condition: "sunny",
        humidity: 65,
        location: input.location,
      };
    },
  });

  // Create provider and agent
  const anthropicProvider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const llmProvider = new LlmProviderAdapter(anthropicProvider);

  const agent = AgentBuilder.create()
    .name("WeatherBot")
    .systemPrompt(
      "You are a weather assistant. Help users with weather information."
    )
    .llmProvider(llmProvider)
    .addTool(weatherTool)
    .addCommonTools()
    .build();

  // Execute with weather query
  const result = await agent.execute({
    initialMessages: [
      MessageManager.createUserMessage("What's the weather in Paris?"),
    ],
  });

  console.log("Weather query complete!");
}

/**
 * Example 3: Streaming responses
 */
async function streamingExample() {
  const anthropicProvider = new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const llmProvider = new LlmProviderAdapter(anthropicProvider);

  const agent = AgentBuilder.create()
    .name("StreamingAssistant")
    .systemPrompt("You are a helpful assistant.")
    .llmProvider(llmProvider)
    .addCommonTools()
    .build();

  console.log("Starting streaming execution...");

  const stream = agent.stream({
    initialMessages: [
      MessageManager.createUserMessage(
        "Explain quantum computing in simple terms"
      ),
    ],
  });

  for await (const event of stream) {
    switch (event.type) {
      case "message":
        console.log("[Message]", event.data);
        break;
      case "tool_call":
        console.log("[Tool Call]", event.data);
        break;
      case "tool_result":
        console.log("[Tool Result]", event.data);
        break;
      case "complete":
        console.log("[Complete]", "Execution finished");
        break;
      case "error":
        console.error("[Error]", event.data);
        break;
    }
  }
}

// Run examples
async function main() {
  console.log("=== Example 1: Basic Agent with Anthropic ===");
  await basicAgentWithAnthropic();

  console.log("\n=== Example 2: Custom Tool ===");
  await customToolExample();

  console.log("\n=== Example 3: Streaming ===");
  await streamingExample();
}

// Only run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { basicAgentWithAnthropic, customToolExample, streamingExample };
