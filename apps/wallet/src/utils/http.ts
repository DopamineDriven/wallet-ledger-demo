import type { IncomingMessage, ServerResponse } from "node:http";

export function sendJson<T>(
  res: ServerResponse,
  statusCode: number,
  data: T
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export function sendError(
  res: ServerResponse,
  statusCode: number,
  message: string
): void {
  sendJson(res, statusCode, { error: message });
}

export function sendNoContent(res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}

export async function parseJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        if (!body) {
          reject(new Error("Empty request body"));
          return;
        }
        resolve(JSON.parse<T>(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

export function extractUserId(req: IncomingMessage): string | null {
  const userId = req.headers["x-user-id"];
  if (typeof userId === "string" && userId.length > 0) {
    return userId;
  }
  return null;
}
