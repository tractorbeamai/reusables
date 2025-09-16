// Agent type from @tractorbeamai/agents
import { AcpServer, type AcpServerOptions } from "./acp-server.js";
import { AcpClient, InMemoryTransport } from "./acp-client.js";
import type { CompleteParams } from "./acp-types.js";

/**
 * AcpAdapter wraps an Agent to make it compatible with the Agent Client Protocol.
 * It provides both server and client capabilities for maximum flexibility.
 */
export class AcpAdapter {
  private server: AcpServer;
  private client?: AcpClient;

  constructor(private readonly agent: any, options?: AcpServerOptions) {
    this.server = new AcpServer(agent, options);
  }

  /**
   * Get the ACP server instance for handling external requests
   */
  getServer(): AcpServer {
    return this.server;
  }

  /**
   * Create a client connected to this adapter's server (useful for testing)
   */
  createLocalClient(): AcpClient {
    if (!this.client) {
      const transport = new InMemoryTransport(this.server);
      this.client = new AcpClient(transport);
    }
    return this.client;
  }

  /**
   * Quick helper to execute a completion request
   */
  async complete(messages: CompleteParams["messages"]): Promise<any> {
    const client = this.createLocalClient();

    // Initialize if not already done
    if (!client["initialized"]) {
      await client.initialize({
        protocolVersion: "1.0.0",
        capabilities: {},
      });
    }

    const result = await client.complete({
      messages,
    });

    return result;
  }

  /**
   * Start the server on a specific port (for HTTP/WebSocket transport)
   */
  async start(port?: number): Promise<void> {
    await this.server.start(port);
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
    await this.server.stop();
  }
}
