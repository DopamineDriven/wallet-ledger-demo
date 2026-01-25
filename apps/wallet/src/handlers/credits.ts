import type { IncomingMessage, ServerResponse } from "node:http";
import type { PrismaClient } from "@wallet-ledger/db";
import { parseJsonBody, sendJson, sendError } from "@/utils/http.ts";
import { isPositiveInteger } from "@/utils/validation.ts";
import { addCredits } from "@/services/ledger.ts";

interface CreditRequest {
  amount: unknown;
}

export async function handlePostCredits(
  req: IncomingMessage,
  res: ServerResponse,
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  let body: CreditRequest;
  try {
    body = await parseJsonBody<CreditRequest>(req);
  } catch {
    sendError(res, 400, "Invalid JSON body");
    return;
  }

  if (!isPositiveInteger(body.amount)) {
    sendError(res, 400, "amount must be a positive integer");
    return;
  }

  const newBalance = await addCredits(prisma, userId, BigInt(body.amount));
  sendJson(res, 200, { balance: Number(newBalance) });
}
