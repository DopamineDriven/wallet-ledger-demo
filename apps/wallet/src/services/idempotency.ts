import type { PrismaClient } from "@wallet-ledger/db/node";
import type { IdempotencySingleton } from "@wallet-ledger/types";
import type { ApiEndpoint } from "@wallet-ledger/db/node/generated/client";
import { createHash } from "node:crypto";

/**
 * Fields needed to create an idempotency record.
 * Omits auto-generated fields (id, createdAt, retryCount, lastRetryAt)
 */
export type IdempotencyCreateInput = Pick<
  IdempotencySingleton,
  "userId" | "endpoint" | "statusCode" | "responseBody" | "ledgerEntryId"
> & {
  /** Raw request body - hashed to generate the key, not stored directly */
  rawBody: string;
};

/**
 * IdempotencyService - Records operation outcomes for audit trail
 *
 * Current implementation: Server-generated keys based on request hash.
 * This provides basic duplicate detection for identical requests within
 * the expiry window.
 *
 * Production implementation would accept client-provided x-idempotency-key
 * header and check for existing records BEFORE processing, replaying
 * cached responses for duplicate keys.
 */
export class IdempotencyService {
  private static readonly EXPIRY_HOURS = 24;

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Generates a deterministic key from request content.
   * Same userId + endpoint + body = same key (natural deduplication)
   */
  private generateKey(
    userId: string,
    endpoint: ApiEndpoint,
    rawBody: string
  ): string {
    const hash = createHash("sha256");
    hash.update(`${userId}:${endpoint}:${rawBody}`);
    return hash.digest("hex").slice(0, 32);
  }

  /**
   * Records an operation outcome after successful completion.
   * Uses upsert to handle potential duplicate concurrent requests gracefully.
   */
  public async recordOperation(input: IdempotencyCreateInput): Promise<void> {
    const key = this.generateKey(input.userId, input.endpoint, input.rawBody);
    const expiresAt = new Date(
      Date.now() + IdempotencyService.EXPIRY_HOURS * 60 * 60 * 1000
    );

    try {
      await this.prisma.idempotencyRecord.upsert({
        where: {
          key_userId: {
            key,
            userId: input.userId
          }
        },
        create: {
          key,
          userId: input.userId,
          endpoint: input.endpoint,
          statusCode: input.statusCode,
          responseBody: input.responseBody,
          ledgerEntryId: input.ledgerEntryId,
          expiresAt
        },
        update: {
          retryCount: { increment: 1 },
          lastRetryAt: new Date()
        }
      });
    } catch (error) {
      // Log but don't fail the request if idempotency recording fails
      console.error("Failed to record idempotency:", error);
    }
  }

  /**
   * Checks for existing record (for future client-key implementation)
   */
  public async findExisting(
    key: string,
    userId: string
  ): Promise<Pick<IdempotencySingleton, "statusCode" | "responseBody"> | null> {
    const record = await this.prisma.idempotencyRecord.findUnique({
      where: {
        key_userId: { key, userId }
      },
      select: {
        statusCode: true,
        responseBody: true,
        expiresAt: true
      }
    });

    if (!record || record.expiresAt < new Date()) {
      return null;
    }

    return { statusCode: record.statusCode, responseBody: record.responseBody };
  }
}
