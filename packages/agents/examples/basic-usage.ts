import { Agent, AgentBuilder, MessageManager } from "../src";
import type { LLMProvider, LLMRequest, LLMResponse } from "../src";
import { z } from "zod";

// Example 1: Basic agent with common tools
async function basicAgentExample() {
  // Mock LLM provider (in real usage, this would come from @llm package)
  const mockLLMProvider: LLMProvider = {
    name: "mock",
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      // Simulate LLM response
      const lastMessage = request.messages[request.messages.length - 1];

      // Simple mock logic
      if (request.messages.length === 1) {
        // First response - think about the problem
        return {
          message: {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: "think_1",
                name: "think",
                input: {
                  thought:
                    "I need to analyze this request and plan my approach.",
                },
              },
            ],
          },
        };
      } else if (request.messages.length === 3) {
        // Second response - make a calculation
        return {
          message: {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: "calc_1",
                name: "calculate",
                input: { expression: "2 + 2" },
              },
            ],
          },
        };
      } else {
        // Final response - conclude
        return {
          message: {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: "conclude_1",
                name: "conclude",
                input: {
                  decision: "The calculation is complete",
                  confidence: 0.95,
                  reasoning: "I successfully calculated 2 + 2 = 4",
                },
              },
            ],
          },
        };
      }
    },
  };

  // Build the agent
  const agent = AgentBuilder.create()
    .name("MathAssistant")
    .description("An agent that can perform calculations")
    .systemPrompt("You are a helpful math assistant.")
    .llmProvider(mockLLMProvider)
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
  console.log("Final conclusion:", result.messages[result.messages.length - 1]);
}

// Example 2: Custom tool implementation
async function customToolExample() {
  const { createTool } = await import("../src");

  // Create a custom weather tool
  const weatherTool = createTool({
    name: "get_weather",
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z.string().describe("The location to get weather for"),
      units: z.enum(["celsius", "fahrenheit"]).default("celsius"),
    }),
    handler: async (input) => {
      // Mock weather API call
      return {
        location: input.location,
        temperature: 22,
        units: input.units,
        conditions: "Partly cloudy",
        humidity: 65,
      };
    },
  });

  // Mock LLM that uses the weather tool
  const weatherLLMProvider: LLMProvider = {
    name: "weather-llm",
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      if (request.messages.length === 1) {
        return {
          message: {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: "weather_1",
                name: "get_weather",
                input: { location: "San Francisco", units: "celsius" },
              },
            ],
          },
        };
      } else {
        return {
          message: {
            role: "assistant",
            content:
              "The weather in San Francisco is 22°C and partly cloudy with 65% humidity.",
          },
        };
      }
    },
  };

  const agent = new Agent({
    name: "WeatherBot",
    systemPrompt: "You are a helpful weather assistant.",
    tools: [weatherTool as any],
    llmProvider: weatherLLMProvider,
  });

  const result = await agent.execute({
    initialMessages: [
      MessageManager.createUserMessage("What's the weather in San Francisco?"),
    ],
  });

  console.log("Weather query complete!");
}

// Example 3: Streaming execution
async function streamingExample() {
  // Mock streaming LLM
  const streamingLLMProvider: LLMProvider = {
    name: "streaming",
    async generateResponse(request: LLMRequest): Promise<LLMResponse> {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (request.messages.length <= 3) {
        return {
          message: {
            role: "assistant",
            content: [
              {
                type: "tool_use",
                id: `think_${Date.now()}`,
                name: "think",
                input: {
                  thought: "Processing step " + request.messages.length,
                },
              },
            ],
          },
        };
      } else {
        return {
          message: {
            role: "assistant",
            content: "Processing complete!",
          },
        };
      }
    },
  };

  const agent = AgentBuilder.create()
    .name("StreamingAgent")
    .systemPrompt("Process the request step by step.")
    .llmProvider(streamingLLMProvider)
    .addCommonTools()
    .build();

  console.log("Starting streaming execution...");

  // Use async generator for streaming
  const stream = agent.stream({
    initialMessages: [
      MessageManager.createUserMessage("Process this in steps"),
    ],
  });

  for await (const event of stream) {
    console.log(`[${event.type}]`, event.data);
  }

  console.log("Streaming complete!");
}

// Run examples
if (require.main === module) {
  (async () => {
    console.log("=== Basic Agent Example ===");
    await basicAgentExample();

    console.log("\n=== Custom Tool Example ===");
    await customToolExample();

    console.log("\n=== Streaming Example ===");
    await streamingExample();
  })().catch(console.error);
}
