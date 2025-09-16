import type {
  Message,
  MessageContent,
  ToolUseContent,
  ToolResultContent,
} from "./types";

export class MessageManager {
  private messages: Message[] = [];
  private messageListeners: ((message: Message) => void)[] = [];

  constructor(initialMessages: Message[] = []) {
    this.messages = [...initialMessages];
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    this.notifyListeners(message);
  }

  addMessages(messages: Message[]): void {
    for (const message of messages) {
      this.addMessage(message);
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getMessagesByRole(role: Message["role"]): Message[] {
    return this.messages.filter((m) => m.role === role);
  }

  getLastMessage(): Message | undefined {
    return this.messages[this.messages.length - 1];
  }

  getLastNMessages(n: number): Message[] {
    return this.messages.slice(-n);
  }

  clear(): void {
    this.messages = [];
  }

  onMessage(listener: (message: Message) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  static createUserMessage(
    content: string | MessageContent | MessageContent[]
  ): Message {
    return {
      role: "user",
      content: typeof content === "string" ? content : content,
    };
  }

  static createAssistantMessage(
    content: string | MessageContent | MessageContent[]
  ): Message {
    return {
      role: "assistant",
      content: typeof content === "string" ? content : content,
    };
  }

  static createSystemMessage(content: string): Message {
    return {
      role: "system",
      content,
    };
  }

  static createToolUseContent(
    name: string,
    input: unknown,
    id?: string
  ): ToolUseContent {
    return {
      type: "tool_use",
      id: id || generateId(),
      name,
      input,
    };
  }

  static createToolResultContent(
    toolUseId: string,
    content: string | object,
    isError = false
  ): ToolResultContent {
    return {
      type: "tool_result",
      tool_use_id: toolUseId,
      content,
      is_error: isError,
    };
  }

  static extractToolCalls(message: Message): ToolUseContent[] {
    const content = Array.isArray(message.content)
      ? message.content
      : [message.content];
    return content.filter(
      (c): c is ToolUseContent =>
        typeof c === "object" && "type" in c && c.type === "tool_use"
    );
  }

  static formatForDisplay(message: Message): string {
    const formatContent = (content: MessageContent): string => {
      if (typeof content === "string") return content;

      switch (content.type) {
        case "text":
          return content.text;
        case "tool_use":
          return `[Tool Call: ${content.name}]`;
        case "tool_result":
          return `[Tool Result${content.is_error ? " (Error)" : ""}: ${
            typeof content.content === "string"
              ? content.content
              : JSON.stringify(content.content)
          }]`;
        default:
          return JSON.stringify(content);
      }
    };

    const contents = Array.isArray(message.content)
      ? message.content
      : [message.content];
    const formatted = contents.map(formatContent).join("\n");

    return `${message.role.toUpperCase()}: ${formatted}`;
  }

  getStats(): {
    totalMessages: number;
    messagesByRole: Record<string, number>;
    toolCalls: number;
    totalTokens?: number;
  } {
    const stats = {
      totalMessages: this.messages.length,
      messagesByRole: {} as Record<string, number>,
      toolCalls: 0,
    };

    for (const message of this.messages) {
      stats.messagesByRole[message.role] =
        (stats.messagesByRole[message.role] || 0) + 1;

      const toolCalls = MessageManager.extractToolCalls(message);
      stats.toolCalls += toolCalls.length;
    }

    return stats;
  }

  private notifyListeners(message: Message): void {
    for (const listener of this.messageListeners) {
      try {
        listener(message);
      } catch (error) {
        console.error("Error in message listener:", error);
      }
    }
  }
}

/**
 * Generate a unique ID for tool calls
 */
function generateId(): string {
  return `tool_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
