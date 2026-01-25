import { randomUUID } from "node:crypto";
import * as dotenv from "dotenv";
import type { PrismaClient } from "@wallet-ledger/db/node";
import { DbService } from "@wallet-ledger/db/node";
import { WalletServer } from "@/server/server.ts";

dotenv.config({ quiet: true });

export interface TestContext {
  server: WalletServer;
  baseUrl: string;
  prisma: PrismaClient;
  cleanup: () => Promise<void>;
}

let portCounter = 4000;

export async function createTestContext(): Promise<TestContext> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL required for tests");
  }

  const db = new DbService(databaseUrl);
  const server = new WalletServer(db.prismaClient);

  const port = portCounter++;
  await new Promise<void>((resolve) => server.listen(port, resolve));

  return {
    server,
    baseUrl: `http://localhost:${port}`,
    prisma: db.prismaClient,
    cleanup: async () => {
      await server.close();
      await db.prismaClient.$disconnect();
    }
  };
}

export function generateUserId(): string {
  return randomUUID();
}

export interface RequestOptions {
  method?: string;
  userId?: string;
  body?: unknown;
}

export async function apiRequest<T = unknown>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {}
): Promise<{ status: number; data: T | null }> {
  const { method = "GET", userId, body } = options;

  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = { method, headers };
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, fetchOptions);

  let data: T | null = null;
  if (response.status !== 204) {
    try {
      data = (await response.json()) as T;
    } catch {
      // No JSON body
    }
  }

  return { status: response.status, data };
}

export async function cleanupUserData(
  prisma: TestContext["prisma"],
  userId: string
): Promise<void> {
  await prisma.ledgerEntry.deleteMany({ where: { userId } });
}
