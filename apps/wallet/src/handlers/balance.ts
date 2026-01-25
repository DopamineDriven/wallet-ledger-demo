import type { ServerResponse } from "node:http";
import type { PrismaClient } from "@wallet-ledger/db";
import { sendJson } from "@/utils/http.ts";
import { calculateBalance } from "@/services/ledger.ts";

export async function handleGetBalance(
  res: ServerResponse,
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  const balance = await calculateBalance(prisma, userId);
  sendJson(res, 200, { balance: Number(balance) });
}
