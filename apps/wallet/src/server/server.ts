import http from "node:http";
import type { ServerResponse, Server } from "node:http";
import type { WalletResolver } from "@/resolver/index.ts";
import type { LoggerService } from "@/services/logger.ts";

export interface WalletServerOptions {
  port: number;
  logger?: LoggerService | undefined;
}

/**
 * WalletServer - HTTP server for wallet API
 *
 * Handles HTTP connections and delegates request handling to WalletResolver.
 * Follows the same pattern as WSServer in the slipstream codebase.
 */
export class WalletServer {
  private httpServer: Server;
  private resolver?: WalletResolver | undefined;
  private logger?: LoggerService | undefined;
  public readonly port: number;

  constructor(private opts: WalletServerOptions) {
    this.port = opts.port;
    this.logger = opts.logger;

    this.httpServer = http.createServer(async (req, res) => {
      const startTime = performance.now();
      const method = req.method ?? "UNKNOWN";
      const url = req.url ?? "/";

      this.logger?.debug("Incoming request", { method, url });

      // Health check endpoint (no auth required)
      if (url === "/health" && method === "GET") {
        this.handleHealthCheck(res, startTime);
        return;
      }

      // Delegate to resolver for API routes
      if (this.resolver) {
        try {
          await this.resolver.handleRequest(req, res);
          const duration = performance.now() - startTime;
          this.logger?.debug("Request completed", { method, url, durationMs: duration });
        } catch (err) {
          const duration = performance.now() - startTime;
          this.logger?.error("Request failed", {
            method,
            url,
            durationMs: duration,
            error: err
          });
          this.sendError(res, 500, "Internal server error");
        }
      } else {
        this.logger?.warn("Resolver not configured");
        this.sendError(res, 503, "Service not ready - resolver not configured");
      }
    });
  }

  /**
   * Injects the resolver for handling API requests
   * Must be called before start()
   */
  public setResolver(resolver: WalletResolver): void {
    this.resolver = resolver;
    this.logger?.debug("Resolver injected");
  }

  /**
   * Starts the HTTP server
   */
  public async start(): Promise<void> {
    return new Promise(resolve => {
      this.httpServer.listen(this.port, () => {
        this.logger?.info(`HTTP server listening on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Gracefully stops the HTTP server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close(err => {
        if (err) {
          this.logger?.error("Error closing server", { error: err });
          reject(err);
        } else {
          this.logger?.info("Server shut down");
          resolve();
        }
      });
    });
  }

  /**
   * Health check endpoint
   */
  private handleHealthCheck(res: ServerResponse, startTime: number): void {
    const processingTime = performance.now() - startTime;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        processingTime: `${processingTime.toFixed(4)}ms`
      })
    );
  }

  private sendError(res: ServerResponse, statusCode: number, message: string): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
}
