import type { PrismaClient } from "@wallet-ledger/db/node";
import type { CatalogItem } from "./items.ts";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function uuidToLockKey(uuid: string): bigint {
  const hex = uuid.replace(/-/g, "");
  const high = BigInt("0x" + hex.slice(0, 16));
  const low = BigInt("0x" + hex.slice(16));
  return high ^ low;
}

export async function calculateBalance(
  prisma: PrismaClient | TransactionClient,
  userId: string
): Promise<bigint> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { userId, status: "COMPLETED" },
    _sum: { amount: true }
  });
  return result._sum.amount ?? 0n;
}

export async function addCredits(
  prisma: PrismaClient,
  userId: string,
  amount: bigint
): Promise<bigint> {
  await prisma.ledgerEntry.create({
    data: {
      userId,
      entryType: "CREDIT",
      amount,
      creditDetail: {
        create: {
          amountAllocated: amount
        }
      }
    }
  });

  return calculateBalance(prisma, userId);
}

export interface PurchaseResult {
  success: boolean;
  insufficientFunds?: boolean;
}

export async function purchaseItem(
  prisma: PrismaClient,
  userId: string,
  item: CatalogItem
): Promise<PurchaseResult> {
  return await prisma.$transaction(async (tx) => {
    const lockKey = uuidToLockKey(userId);
    await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock($1)`, lockKey);

    const balance = await calculateBalance(tx, userId);

    if (balance < BigInt(item.price)) {
      return { success: false, insufficientFunds: true };
    }

    await tx.ledgerEntry.create({
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
      }
    });

    return { success: true };
  });
}
