import { z } from "zod";
import type { ToolDefinition, ToolContext, ToolResult } from "./types";

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a new tool
   */
  register<TInput = unknown, TOutput = unknown>(
    tool: ToolDefinition<TInput, TOutput>
  ): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered`);
    }
    this.tools.set(tool.name, tool as ToolDefinition);
  }

  /**
   * Register multiple tools at once
   */
  registerMany(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Execute a tool
   */
  async execute(
    name: string,
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const tool = this.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${name}" not found`,
      };
    }

    try {
      // Validate input
      const validatedInput = tool.inputSchema.parse(input);

      // Apply timeout if configured
      const timeout = tool.config?.timeout;
      if (timeout) {
        const timeoutPromise = new Promise<ToolResult>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error(`Tool execution timed out after ${timeout}ms`)),
            timeout
          )
        );

        return await Promise.race([
          tool.handler(validatedInput, context),
          timeoutPromise,
        ]);
      }

      // Execute the tool
      return await tool.handler(validatedInput, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Invalid input: ${error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get tool definitions in a format suitable for LLM providers
   */
  getToolDefinitions(): Array<{
    name: string;
    description: string;
    parameters: object;
  }> {
    return this.getAll().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.inputSchema),
    }));
  }
}

/**
 * Convert Zod schema to JSON Schema (simplified version)
 * In production, you might want to use a library like zod-to-json-schema
 */
function zodToJsonSchema(schema: z.ZodSchema<any>): object {
  // This is a simplified implementation
  // For production, consider using @zod-tools/json-schema
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodSchema<any>);
      if (!value.isOptional()) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToJsonSchema(schema.element as z.ZodSchema<any>),
    };
  }

  // Default fallback
  return { type: "string" };
}
