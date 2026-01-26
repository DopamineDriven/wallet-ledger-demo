import type { PrismaClient } from "@wallet-ledger/db/node";
import type { CatalogItem } from "./items.ts";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface PurchaseResult {
  success: boolean;
  insufficientFunds?: boolean;
  ledgerEntryId?: string;
}

export interface CreditResult {
  balance: bigint;
  ledgerEntryId: string;
}

/**
 * LedgerService - Core ledger operations with advisory lock concurrency control
 *
 * Handles all balance calculations, credit additions, and purchase transactions
 * using PostgreSQL advisory locks to prevent race conditions and overdrafts.
 */
export class LedgerService {
  protected readonly prismaClient: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prismaClient = prisma;
  }

  /**
   * Converts UUID to a 64-bit lock key for pg_advisory_xact_lock
   * XORs high and low 64-bit halves of the UUID hex representation
   * Uses BigInt.asIntN to ensure signed 64-bit range (PostgreSQL bigint is signed)
   */
  protected uuidToLockKey(uuid: string): bigint {
    const hex = uuid.replace(/-/g, "");
    const high = BigInt("0x" + hex.slice(0, 16));
    const low = BigInt("0x" + hex.slice(16));
    return BigInt.asIntN(64, high ^ low);
  }

  /**
   * Calculates user balance by summing all COMPLETED ledger entries
   * Credits are positive, debits are negative - sum gives balance directly
   */
  public async calculateBalance(
    prisma: PrismaClient | TransactionClient,
    userId: string
  ): Promise<bigint> {
    const result = await prisma.ledgerEntry.aggregate({
      where: { userId, status: "COMPLETED" },
      _sum: { amount: true }
    });
    return result._sum.amount ?? 0n;
  }

  /**
   * Gets the current balance for a user
   */
  public async getBalance(userId: string): Promise<bigint> {
    return this.calculateBalance(this.prismaClient, userId);
  }

  /**
   * Adds credits to a user's wallet
   * Creates a CREDIT ledger entry with associated CreditDetail
   * Returns the new balance and ledgerEntryId after credit addition
   */
  public async addCredits(userId: string, amount: bigint): Promise<CreditResult> {
    const entry = await this.prismaClient.ledgerEntry.create({
      data: {
        userId,
        entryType: "CREDIT",
        amount,
        creditDetail: {
          create: {
            amountAllocated: amount
          }
        }
      },
      select: { id: true }
    });

    const balance = await this.calculateBalance(this.prismaClient, userId);
    return { balance, ledgerEntryId: entry.id };
  }

  /**
   * Purchases an item with concurrency-safe balance check
   *
   * Uses PostgreSQL advisory locks to serialize concurrent purchases per-user:
   * 1. Acquires transaction-scoped advisory lock keyed to user's UUID
   * 2. Calculates balance WITHIN the transaction (after acquiring lock)
   * 3. Checks sufficient funds
   * 4. Creates DEBIT entry with price snapshot in DebitDetail
   * 5. Lock auto-releases on commit/rollback
   *
   * Different users can purchase concurrently without blocking each other.
   */
  public async purchaseItem(
    userId: string,
    item: CatalogItem
  ): Promise<PurchaseResult> {
    return await this.prismaClient.$transaction(async tx => {
      const lockKey = this.uuidToLockKey(userId);
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock($1)`, lockKey);

      const balance = await this.calculateBalance(tx, userId);

      if (balance < BigInt(item.price)) {
        return { success: false, insufficientFunds: true };
      }

      const entry = await tx.ledgerEntry.create({
        data: {
          userId,
          entryType: "DEBIT",
          amount: -BigInt(item.price),
          debitDetail: {
            create: {
              itemId: item.id,
              itemName: item.name,
              amount: BigInt(item.price)
            }
          }
        },
        select: { id: true }
      });

      return { success: true, ledgerEntryId: entry.id };
    });
  }
}
