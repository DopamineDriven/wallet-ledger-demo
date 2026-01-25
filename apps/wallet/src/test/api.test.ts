import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import {
  createTestContext,
  generateUserId,
  apiRequest,
  cleanupUserData,
  type TestContext
} from "./helpers.ts";
import { CATALOG_ITEMS } from "@/services/items.ts";

const IPHONE_13_PRO = CATALOG_ITEMS[0]!;
const APPLE_WATCH = CATALOG_ITEMS[3]!;

describe("Wallet API", async () => {
  let ctx: TestContext;
  let testUserId: string;

  before(async () => {
    ctx = await createTestContext();
    testUserId = generateUserId();
  });

  after(async () => {
    await cleanupUserData(ctx.prisma, testUserId);
    await ctx.cleanup();
  });

  describe("GET /api/items", () => {
    it("should return 400 without x-user-id header", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/items"
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "x-user-id header required");
    });

    it("should return 400 with invalid UUID", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/items",
        { userId: "not-a-uuid" }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "x-user-id must be a valid UUID");
    });

    it("should return catalog items with valid user", async () => {
      const { status, data } = await apiRequest<typeof CATALOG_ITEMS>(
        ctx.baseUrl,
        "/api/items",
        { userId: testUserId }
      );
      assert.equal(status, 200);
      assert.equal(Array.isArray(data), true);
      assert.equal(data?.length, 4);
      const firstItem = data?.[0];
      assert.equal(firstItem?.name, "iPhone 13 Pro");
      assert.equal(firstItem?.price, 109999);
    });
  });

  describe("GET /api/balance", () => {
    it("should return 0 for new user", async () => {
      const newUserId = generateUserId();
      const { status, data } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId: newUserId }
      );
      assert.equal(status, 200);
      assert.equal(data?.balance, 0);
    });
  });

  describe("POST /api/credits", () => {
    it("should return 400 with empty body", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "Invalid JSON body");
    });

    it("should return 400 with negative amount", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: -100 } }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "amount must be a positive integer");
    });

    it("should return 400 with zero amount", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: 0 } }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "amount must be a positive integer");
    });

    it("should return 400 with float amount", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: 100.5 } }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "amount must be a positive integer");
    });

    it("should return 400 with string amount", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: "100" } }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "amount must be a positive integer");
    });

    it("should add credits and return new balance", async () => {
      const { status, data } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: 50000 } }
      );
      assert.equal(status, 200);
      assert.equal(data?.balance, 50000);
    });

    it("should accumulate credits correctly", async () => {
      const { status, data } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/credits",
        { method: "POST", userId: testUserId, body: { amount: 25000 } }
      );
      assert.equal(status, 200);
      assert.equal(data?.balance, 75000);
    });
  });

  describe("POST /api/purchases", () => {
    let purchaseUserId: string;

    before(async () => {
      purchaseUserId = generateUserId();
      await apiRequest(ctx.baseUrl, "/api/credits", {
        method: "POST",
        userId: purchaseUserId,
        body: { amount: 200000 }
      });
    });

    after(async () => {
      await cleanupUserData(ctx.prisma, purchaseUserId);
    });

    it("should return 400 with empty body", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/purchases",
        { method: "POST", userId: purchaseUserId }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "Invalid JSON body");
    });

    it("should return 400 with invalid itemId format", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/purchases",
        { method: "POST", userId: purchaseUserId, body: { itemId: "not-uuid" } }
      );
      assert.equal(status, 400);
      assert.equal(data?.error, "itemId must be a valid UUID");
    });

    it("should return 404 for non-existent item", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/purchases",
        {
          method: "POST",
          userId: purchaseUserId,
          body: { itemId: "00000000-0000-4000-a000-000000000000" }
        }
      );
      assert.equal(status, 404);
      assert.equal(data?.error, "Item not found");
    });

    it("should purchase item and return 204", async () => {
      const { status, data } = await apiRequest(
        ctx.baseUrl,
        "/api/purchases",
        { method: "POST", userId: purchaseUserId, body: { itemId: APPLE_WATCH.id } }
      );
      assert.equal(status, 204);
      assert.equal(data, null);
    });

    it("should deduct balance after purchase", async () => {
      const { status, data } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId: purchaseUserId }
      );
      assert.equal(status, 200);
      assert.equal(data?.balance, 200000 - APPLE_WATCH.price);
    });

    it("should return 409 for insufficient balance", async () => {
      const poorUserId = generateUserId();
      await apiRequest(ctx.baseUrl, "/api/credits", {
        method: "POST",
        userId: poorUserId,
        body: { amount: 1000 }
      });

      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/purchases",
        { method: "POST", userId: poorUserId, body: { itemId: IPHONE_13_PRO.id } }
      );
      assert.equal(status, 409);
      assert.equal(data?.error, "Insufficient balance");

      await cleanupUserData(ctx.prisma, poorUserId);
    });
  });

  describe("404 for unknown routes", () => {
    it("should return 404 for unknown path", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/unknown",
        { userId: testUserId }
      );
      assert.equal(status, 404);
      assert.equal(data?.error, "Not found");
    });

    it("should return 404 for wrong method", async () => {
      const { status, data } = await apiRequest<{ error: string }>(
        ctx.baseUrl,
        "/api/items",
        { method: "POST", userId: testUserId, body: {} }
      );
      assert.equal(status, 404);
    });
  });
});
