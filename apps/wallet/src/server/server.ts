import { createServer, type Server } from "node:http";
import type { PrismaClient } from "@wallet-ledger/db/node";
import { extractUserId, sendError } from "@/utils/http.ts";
import { isValidUuid } from "@/utils/validation.ts";
import { handleGetItems } from "@/handlers/items.ts";
import { handleGetBalance } from "@/handlers/balance.ts";
import { handlePostCredits } from "@/handlers/credits.ts";
import { handlePostPurchases } from "@/handlers/purchases.ts";

export class WalletServer {
  private server;
  private prisma;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.server = createServer(async (req, res) => {
      try {
        await this.handleRequest(req, res);
      } catch (err) {
        console.error("Request error:", err);
        sendError(res, 500, "Internal server error");
      }
    });
  }

  private async handleRequest(
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse
  ): Promise<void> {
    const userId = extractUserId(req);

    if (!userId) {
      sendError(res, 400, "x-user-id header required");
      return;
    }

    if (!isValidUuid(userId)) {
      sendError(res, 400, "x-user-id must be a valid UUID");
      return;
    }

    const url = req.url ?? "";
    const method = req.method ?? "";

    if (url === "/api/items" && method === "GET") {
      handleGetItems(res);
      return;
    }

    if (url === "/api/balance" && method === "GET") {
      await handleGetBalance(res, this.prisma, userId);
      return;
    }

    if (url === "/api/credits" && method === "POST") {
      await handlePostCredits(req, res, this.prisma, userId);
      return;
    }

    if (url === "/api/purchases" && method === "POST") {
      await handlePostPurchases(req, res, this.prisma, userId);
      return;
    }

    sendError(res, 404, "Not found");
  }

  listen(port: number, callback?: () => void): void {
    this.server.listen(port, callback);
  }

  close() {
    const promise = new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) reject(err);
        else return resolve;
      });
    });
  }
}
