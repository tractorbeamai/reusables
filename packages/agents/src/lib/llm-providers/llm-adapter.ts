import type {
  BaseLLMProvider as UniversalProvider,
  GenerateOptions,
  Tool,
} from "@tractorbeamai/llm";
import type { LLMProvider, LLMRequest, LLMResponse } from "../types";

export class LlmProviderAdapter implements LLMProvider {
  readonly name: string;

  constructor(private readonly provider: UniversalProvider) {
    this.name = provider.name;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const tools: Tool[] | undefined = request.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      zodInputSchema: t.inputSchema,
    }));

    const options: Partial<GenerateOptions> = {
      systemPrompt: request.systemPrompt,
      tools,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      metadata: request.metadata,
    };

    const response = await this.provider.generate(request.messages, options);

    return {
      message: {
        role: "assistant",
        content: response.content,
        metadata: { stopReason: response.stopReason },
      },
      usage: response.tokenUsage
        ? {
            promptTokens: response.tokenUsage.inputTokens ?? 0,
            completionTokens: response.tokenUsage.outputTokens ?? 0,
            totalTokens:
              (response.tokenUsage.inputTokens ?? 0) +
              (response.tokenUsage.outputTokens ?? 0),
          }
        : undefined,
      metadata: {
        stopReason: response.stopReason,
        model: response.tokenUsage?.model,
      },
    };
  }
}
