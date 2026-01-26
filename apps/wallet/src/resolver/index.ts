import type { IncomingMessage, ServerResponse } from "node:http";
import { IdempotencyService } from "@/services/idempotency.ts";
import { ItemsService } from "@/services/items.ts";
import { LedgerService } from "@/services/ledger.ts";
import { ValidationService } from "@/services/validation.ts";

/**
 * Valid API routes for the wallet service
 */
const API_ROUTES = {
  ITEMS: "/api/items",
  BALANCE: "/api/balance",
  CREDITS: "/api/credits",
  PURCHASES: "/api/purchases"
} as const;

/**
 * Common typos and variations that should suggest the correct endpoint
 */
const ROUTE_SUGGESTIONS: Record<string, string> = {
  "/api/balances": API_ROUTES.BALANCE,
  "/api/item": API_ROUTES.ITEMS,
  "/api/credit": API_ROUTES.CREDITS,
  "/api/purchase": API_ROUTES.PURCHASES,
  "/api/buy": API_ROUTES.PURCHASES,
  "/api/wallet": API_ROUTES.BALANCE,
  "/api/funds": API_ROUTES.BALANCE
};

interface CreditRequest {
  amount: unknown;
}

interface PurchaseRequest {
  itemId: unknown;
}

/**
 * WalletResolver - Request routing and handling
 *
 * Dispatches incoming HTTP requests to appropriate handlers.
 * Similar to the Resolver pattern in the slipstream ws-server.
 */
export class WalletResolver {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly itemsService: ItemsService,
    private readonly idempotencyService: IdempotencyService
  ) {}

  /**
   * Main request handler - validates user ID and routes to appropriate handler
   */
  public async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const userId = this.extractUserId(req);

    if (!userId) {
      this.sendError(res, 400, "x-user-id header required");
      return;
    }

    if (!ValidationService.isValidUuid(userId)) {
      this.sendError(res, 400, "x-user-id must be a valid UUID");
      return;
    }

    const url = req.url ?? "";
    const method = req.method ?? "";

    // Route to appropriate handler
    switch (true) {
      case url === API_ROUTES.ITEMS && method === "GET":
        this.handleGetItems(res);
        break;

      case url === API_ROUTES.BALANCE && method === "GET":
        await this.handleGetBalance(res, userId);
        break;

      case url === API_ROUTES.CREDITS && method === "POST":
        await this.handlePostCredits(req, res, userId);
        break;

      case url === API_ROUTES.PURCHASES && method === "POST":
        await this.handlePostPurchases(req, res, userId);
        break;

      default:
        this.handleNotFound(res, url);
    }
  }

  /**
   * GET /api/items - Returns all catalog items
   */
  private handleGetItems(res: ServerResponse): void {
    this.sendJson(res, 200, this.itemsService.getAll());
  }

  /**
   * GET /api/balance - Returns user's current balance
   */
  private async handleGetBalance(
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    const balance = await this.ledgerService.getBalance(userId);
    this.sendJson(res, 200, { balance: Number(balance) });
  }

  /**
   * POST /api/credits - Adds credits to user's wallet
   */
  private async handlePostCredits(
    req: IncomingMessage,
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    let body: CreditRequest;
    let rawBody: string;
    try {
      rawBody = await this.readRawBody(req);
      body = JSON.parse(rawBody) as CreditRequest;
    } catch {
      this.sendError(res, 400, "Invalid JSON body");
      return;
    }

    if (!ValidationService.isPositiveInteger(body.amount)) {
      this.sendError(res, 400, "amount must be a positive integer");
      return;
    }

    const result = await this.ledgerService.addCredits(
      userId,
      BigInt(body.amount)
    );

    const responseBody = { balance: Number(result.balance) };

    // Record operation for audit trail
    await this.idempotencyService.recordOperation({
      userId,
      endpoint: "CREDITS",
      rawBody,
      statusCode: 200,
      responseBody: JSON.stringify(responseBody),
      ledgerEntryId: result.ledgerEntryId
    });

    this.sendJson(res, 200, responseBody);
  }

  /**
   * POST /api/purchases - Purchases an item
   */
  private async handlePostPurchases(
    req: IncomingMessage,
    res: ServerResponse,
    userId: string
  ): Promise<void> {
    let body: PurchaseRequest;
    let rawBody: string;
    try {
      rawBody = await this.readRawBody(req);
      body = JSON.parse(rawBody) as PurchaseRequest;
    } catch {
      this.sendError(res, 400, "Invalid JSON body");
      return;
    }

    if (
      typeof body.itemId !== "string" ||
      !ValidationService.isValidUuid(body.itemId)
    ) {
      this.sendError(res, 400, "itemId must be a valid UUID");
      return;
    }

    const item = this.itemsService.getById(body.itemId);
    if (!item) {
      this.sendError(res, 404, "Item not found");
      return;
    }

    const result = await this.ledgerService.purchaseItem(userId, item);

    if (!result.success) {
      if (result.insufficientFunds) {
        this.sendError(res, 409, "Insufficient balance");
        return;
      }
      this.sendError(res, 500, "Purchase failed");
      return;
    }

    // Record successful purchase for audit trail
    await this.idempotencyService.recordOperation({
      userId,
      endpoint: "PURCHASES",
      rawBody,
      statusCode: 204,
      responseBody: null,
      ledgerEntryId: result?.ledgerEntryId ?? null
    });

    this.sendNoContent(res);
  }

  /**
   * Handles 404 with helpful suggestions for common typos
   */
  private handleNotFound(res: ServerResponse, url: string): void {
    const suggestion = ROUTE_SUGGESTIONS[url];
    if (suggestion) {
      this.sendError(res, 404, `Not found. Did you mean ${suggestion}?`);
    } else {
      this.sendError(res, 404, "Not found");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility methods
  // ─────────────────────────────────────────────────────────────────────────────

  private extractUserId(req: IncomingMessage): string | null {
    const userId = req.headers["x-user-id"];
    if (typeof userId === "string" && userId.length > 0) {
      return userId;
    }
    return null;
  }

  private sendJson<T>(res: ServerResponse, statusCode: number, data: T): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  private sendError(
    res: ServerResponse,
    statusCode: number,
    message: string
  ): void {
    this.sendJson(res, statusCode, { error: message });
  }

  private sendNoContent(res: ServerResponse): void {
    res.writeHead(204);
    res.end();
  }

  private readRawBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      req.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf-8");
        if (!body) {
          reject(new Error("Empty request body"));
          return;
        }
        resolve(body);
      });

      req.on("error", reject);
    });
  }
}
