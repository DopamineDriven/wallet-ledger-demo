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
const AIRPODS_MAX = CATALOG_ITEMS[2]!;
const APPLE_WATCH = CATALOG_ITEMS[3]!;

describe("Concurrency Safety", async () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await createTestContext();
  });

  after(async () => {
    await ctx.cleanup();
  });

  describe("Rapid-fire concurrent purchases", () => {
    it("should prevent overdraft with 10 simultaneous purchase attempts", async () => {
      const userId = generateUserId();

      // Add exactly enough for 2 purchases
      const creditAmount = APPLE_WATCH.price * 2;
      await apiRequest(ctx.baseUrl, "/api/credits", {
        method: "POST",
        userId,
        body: { amount: creditAmount }
      });

      // Fire 10 concurrent purchase requests
      const purchasePromises = Array.from({ length: 10 }, () =>
        apiRequest<{ error?: string }>(ctx.baseUrl, "/api/purchases", {
          method: "POST",
          userId,
          body: { itemId: APPLE_WATCH.id }
        })
      );

      const results = await Promise.all(purchasePromises);

      const successes = results.filter((r) => r.status === 204);
      const insufficientFunds = results.filter((r) => r.status === 409);

      // Exactly 2 should succeed, 8 should fail with 409
      assert.equal(
        successes.length,
        2,
        `Expected 2 successes, got ${successes.length}`
      );
      assert.equal(
        insufficientFunds.length,
        8,
        `Expected 8 insufficient funds, got ${insufficientFunds.length}`
      );

      // Verify final balance is exactly 0
      const { data: balanceData } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId }
      );
      assert.equal(balanceData?.balance, 0, "Balance should be exactly 0");

      await cleanupUserData(ctx.prisma, userId);
    });

    it("should handle 20 concurrent purchases with enough funds for 5", async () => {
      const userId = generateUserId();

      // Add enough for exactly 5 purchases
      const creditAmount = AIRPODS_MAX.price * 5;
      await apiRequest(ctx.baseUrl, "/api/credits", {
        method: "POST",
        userId,
        body: { amount: creditAmount }
      });

      // Fire 20 concurrent requests
      const purchasePromises = Array.from({ length: 20 }, () =>
        apiRequest<{ error?: string }>(ctx.baseUrl, "/api/purchases", {
          method: "POST",
          userId,
          body: { itemId: AIRPODS_MAX.id }
        })
      );

      const results = await Promise.all(purchasePromises);

      const successes = results.filter((r) => r.status === 204);
      const insufficientFunds = results.filter((r) => r.status === 409);

      assert.equal(
        successes.length,
        5,
        `Expected 5 successes, got ${successes.length}`
      );
      assert.equal(
        insufficientFunds.length,
        15,
        `Expected 15 insufficient funds, got ${insufficientFunds.length}`
      );

      const { data: balanceData } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId }
      );
      assert.equal(balanceData?.balance, 0);

      await cleanupUserData(ctx.prisma, userId);
    });

    it("should never allow negative balance under stress", async () => {
      const userId = generateUserId();

      // Add enough for 1.5 purchases (should only allow 1)
      const creditAmount = Math.floor(IPHONE_13_PRO.price * 1.5);
      await apiRequest(ctx.baseUrl, "/api/credits", {
        method: "POST",
        userId,
        body: { amount: creditAmount }
      });

      // Fire 50 concurrent requests
      const purchasePromises = Array.from({ length: 50 }, () =>
        apiRequest<{ error?: string }>(ctx.baseUrl, "/api/purchases", {
          method: "POST",
          userId,
          body: { itemId: IPHONE_13_PRO.id }
        })
      );

      const results = await Promise.all(purchasePromises);

      const successes = results.filter((r) => r.status === 204);

      // Only 1 should succeed
      assert.equal(
        successes.length,
        1,
        `Expected 1 success, got ${successes.length}`
      );

      // Verify balance is non-negative
      const { data: balanceData } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId }
      );
      assert.ok(
        balanceData!.balance >= 0,
        `Balance should be non-negative, got ${balanceData?.balance}`
      );
      assert.equal(
        balanceData?.balance,
        creditAmount - IPHONE_13_PRO.price,
        "Balance should be credit minus one item price"
      );

      await cleanupUserData(ctx.prisma, userId);
    });
  });

  describe("Concurrent users independence", () => {
    it("should not block different users from purchasing simultaneously", async () => {
      const users = Array.from({ length: 5 }, () => generateUserId());

      // Give each user exactly enough for 1 purchase
      await Promise.all(
        users.map((userId) =>
          apiRequest(ctx.baseUrl, "/api/credits", {
            method: "POST",
            userId,
            body: { amount: APPLE_WATCH.price }
          })
        )
      );

      // All 5 users purchase at the same time
      const purchasePromises = users.map((userId) =>
        apiRequest<{ error?: string }>(ctx.baseUrl, "/api/purchases", {
          method: "POST",
          userId,
          body: { itemId: APPLE_WATCH.id }
        })
      );

      const results = await Promise.all(purchasePromises);

      // All should succeed since they're different users
      const successes = results.filter((r) => r.status === 204);
      assert.equal(
        successes.length,
        5,
        `All 5 users should succeed, got ${successes.length}`
      );

      // Verify all balances are 0
      const balancePromises = users.map((userId) =>
        apiRequest<{ balance: number }>(ctx.baseUrl, "/api/balance", { userId })
      );
      const balances = await Promise.all(balancePromises);

      for (const { data } of balances) {
        assert.equal(data?.balance, 0);
      }

      // Cleanup
      await Promise.all(
        users.map((userId) => cleanupUserData(ctx.prisma, userId))
      );
    });
  });

  describe("Mixed concurrent credits and purchases", () => {
    it("should handle interleaved credits and purchases correctly", async () => {
      const userId = generateUserId();

      // Start with 0 balance - purchase should fail
      // Add credit - purchase should succeed
      // Both happen nearly simultaneously

      const ops = [
        // First add credit
        apiRequest(ctx.baseUrl, "/api/credits", {
          method: "POST",
          userId,
          body: { amount: APPLE_WATCH.price }
        }),
        // Then try purchase (might race with credit)
        apiRequest(ctx.baseUrl, "/api/purchases", {
          method: "POST",
          userId,
          body: { itemId: APPLE_WATCH.id }
        })
      ] as const;

      const [creditResult, purchaseResult] = await Promise.all(ops);

      // Credit should always succeed
      assert.equal(creditResult.status, 200);

      // Purchase might succeed or fail depending on timing
      // Either is valid - we just need to verify final balance is consistent
      const { data: finalBalance } = await apiRequest<{ balance: number }>(
        ctx.baseUrl,
        "/api/balance",
        { userId }
      );

      if (purchaseResult.status === 204) {
        assert.equal(
          finalBalance?.balance,
          0,
          "If purchase succeeded, balance should be 0"
        );
      } else {
        assert.equal(
          finalBalance?.balance,
          APPLE_WATCH.price,
          "If purchase failed, balance should equal credit amount"
        );
      }

      await cleanupUserData(ctx.prisma, userId);
    });
  });
});
