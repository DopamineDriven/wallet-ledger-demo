import type { IncomingMessage, ServerResponse } from "node:http";
import type { PrismaClient } from "@wallet-ledger/db/node";
import { parseJsonBody, sendNoContent, sendError } from "@/utils/http.ts";
import { isValidUuid } from "@/utils/validation.ts";
import { getItemById } from "@/services/items.ts";
import { purchaseItem } from "@/services/ledger.ts";

interface PurchaseRequest {
  itemId: unknown;
}

export async function handlePostPurchases(
  req: IncomingMessage,
  res: ServerResponse,
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  let body: PurchaseRequest;
  try {
    body = await parseJsonBody<PurchaseRequest>(req);
  } catch {
    sendError(res, 400, "Invalid JSON body");
    return;
  }

  if (typeof body.itemId !== "string" || !isValidUuid(body.itemId)) {
    sendError(res, 400, "itemId must be a valid UUID");
    return;
  }

  const item = getItemById(body.itemId);
  if (!item) {
    sendError(res, 404, "Item not found");
    return;
  }

  const result = await purchaseItem(prisma, userId, item);

  if (!result.success) {
    if (result.insufficientFunds) {
      sendError(res, 409, "Insufficient balance");
      return;
    }
    sendError(res, 500, "Purchase failed");
    return;
  }

  sendNoContent(res);
}
