import { WalletServer } from "@/server/server.ts";
import * as dotenv from "dotenv";
import { DbServiceMixin, PrismaDbService } from "@wallet-ledger/db/factory";
import { DbService } from "@wallet-ledger/db/node";

dotenv.config({ quiet: true });

export { WalletServer } from "@/server/server.ts";
export { CATALOG_ITEMS, getAllItems, getItemById } from "@/services/items.ts";
export type { CatalogItem } from "@/services/items.ts";

declare module "http" {
  interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
    "x-idempotency-key"?: string;
    "x-user-id"?: string;
  }
}

declare global {
  interface JSON {
    parse<T = unknown>(
      text: string,
      reviver?: (this: any, key: string, value: any) => any
    ): T;
  }
  interface Body {
    json<T = unknown>(): Promise<T>;
  }
  interface Response {
    json<T = unknown>(): Promise<T>;
  }
  interface ObjectConstructor {
    keys<T = object>(
      o: T
    ): (keyof T extends infer K
      ? K extends string
        ? K
        : K extends number
          ? `${K}`
          : never
      : never)[];
    entries<T = object, V extends keyof T = keyof T>(
      o: T
    ): (V extends infer K
      ? K extends string
        ? [K, T[V]]
        : K extends number
          ? [`${K}`, T[V]]
          : never
      : never)[];
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const db = new PrismaDbService({
    connectionString: databaseUrl,
    idleTimeoutMs: 30000,
    poolMax: 1000
  }).dbBase;
  const server = new WalletServer(db.prismaClient);

  const port = parseInt(process.env.PORT ?? "3000", 10);

  server.listen(port, () => {
    console.log(`Wallet server listening on port ${port}`);
  });

  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await server.close();
    await db.prismaClient.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    await server.close();
    await db.prismaClient.$disconnect();
    process.exit(0);
  });
}

main();
