import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  Message,
  ToolDefinition,
} from "../types";

export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;

  protected constructor(protected config: Record<string, unknown> = {}) {}

  abstract generateResponse(request: LLMRequest): Promise<LLMResponse>;

  /**
   * Convert tools to provider-specific format
   */
  protected abstract formatTools(tools: ToolDefinition[]): unknown;

  /**
   * Convert messages to provider-specific format
   */
  protected abstract formatMessages(messages: Message[]): unknown;

  /**
   * Parse provider response to standard format
   */
  protected abstract parseResponse(response: unknown): LLMResponse;

  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    // Override in subclasses to validate provider-specific config
  }

  /**
   * Get default parameters for the provider
   */
  protected getDefaultParams(): Record<string, unknown> {
    return {
      temperature: 0.7,
      maxTokens: 2048,
    };
  }
}
