import { z } from "zod";
import type { ToolDefinition } from "./types";

export const thinkTool: ToolDefinition<{ thought: string }, void> = {
  name: "think",
  description:
    "Use this tool to think through a problem, reason about the task, or plan your approach",
  inputSchema: z.object({
    thought: z.string().describe("Your internal thought process"),
  }),
  handler: async (input, context) => {
    // The thought is captured in the message history
    // This tool mainly serves to structure the agent's reasoning
    return {
      success: true,
      metadata: { thoughtLength: input.thought.length },
    };
  },
};

export const calculateTool: ToolDefinition<{ expression: string }, number> = {
  name: "calculate",
  description: "Perform mathematical calculations",
  inputSchema: z.object({
    expression: z.string().describe("Mathematical expression to evaluate"),
  }),
  handler: async (input) => {
    try {
      const result = Function(`"use strict"; return (${input.expression})`)();

      if (typeof result !== "number" || !isFinite(result)) {
        return {
          success: false,
          error: "Invalid calculation result",
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Calculation error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },
};

export const memoryTool: ToolDefinition<
  { action: "store" | "retrieve" | "list"; key?: string; value?: unknown },
  unknown
> = {
  name: "memory",
  description: "Store and retrieve information for later use",
  inputSchema: z.object({
    action: z.enum(["store", "retrieve", "list"]).describe("Action to perform"),
    key: z.string().optional().describe("Key for the memory item"),
    value: z.unknown().optional().describe("Value to store"),
  }),
  handler: async (input, context) => {
    const memory =
      (context.metadata.memory as Map<string, unknown>) ||
      new Map<string, unknown>();

    switch (input.action) {
      case "store":
        if (!input.key) {
          return { success: false, error: "Key is required for store action" };
        }
        memory.set(input.key, input.value);
        context.metadata.memory = memory;
        return { success: true };

      case "retrieve":
        if (!input.key) {
          return {
            success: false,
            error: "Key is required for retrieve action",
          };
        }
        return {
          success: true,
          data: memory.get(input.key),
        };

      case "list":
        return {
          success: true,
          data: Array.from(memory.keys()),
        };

      default:
        return { success: false, error: "Invalid action" };
    }
  },
};

export const concludeTool: ToolDefinition<
  { decision: string; confidence: number; reasoning?: string },
  { decision: string; confidence: number; reasoning?: string }
> = {
  name: "conclude",
  description: "Make a final decision or conclusion",
  inputSchema: z.object({
    decision: z.string().describe("The final decision or conclusion"),
    confidence: z.number().min(0).max(1).describe("Confidence level (0-1)"),
    reasoning: z
      .string()
      .optional()
      .describe("Optional reasoning for the decision"),
  }),
  handler: async (input) => {
    return {
      success: true,
      data: input,
    };
  },
};

export const webSearchTool: ToolDefinition<
  { query: string; maxResults?: number },
  Array<{ title: string; url: string; snippet: string }>
> = {
  name: "web_search",
  description: "Search the web for information",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    maxResults: z
      .number()
      .min(1)
      .max(10)
      .default(5)
      .describe("Maximum number of results"),
  }),
  handler: async (input) => {
    return {
      success: true,
      data: [
        {
          title: `Search result for: ${input.query}`,
          url: "https://example.com",
          snippet:
            "This is a mock search result. In a real implementation, this would call a search API.",
        },
      ],
    };
  },
};

export function createTool<TInput, TOutput>(config: {
  name: string;
  description: string;
  inputSchema: z.ZodSchema<TInput>;
  handler: (
    input: TInput,
    context: ToolDefinition["handler"] extends (
      input: any,
      context: infer C
    ) => any
      ? C
      : never
  ) => Promise<TOutput> | TOutput;
  config?: ToolDefinition["config"];
}): ToolDefinition<TInput, TOutput> {
  return {
    ...config,
    handler: async (input, context) => {
      try {
        const result = await config.handler(input, context);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
