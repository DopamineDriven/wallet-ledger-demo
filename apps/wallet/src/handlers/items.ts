import type { ServerResponse } from "node:http";
import { sendJson } from "@/utils/http.ts";
import { getAllItems } from "@/services/items.ts";

export function handleGetItems(res: ServerResponse): void {
  sendJson(res, 200, getAllItems());
}
