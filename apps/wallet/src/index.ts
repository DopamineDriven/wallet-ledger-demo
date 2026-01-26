import { WalletResolver } from "@/resolver/index.ts";
import { WalletServer } from "@/server/server.ts";
import { IdempotencyService } from "@/services/idempotency.ts";
import { ItemsService } from "@/services/items.ts";
import { LedgerService } from "@/services/ledger.ts";
import { LoggerService } from "@/services/logger.ts";
import * as dotenv from "dotenv";
import { DbService } from "@wallet-ledger/db/node";

dotenv.config({ quiet: true });

export { WalletServer } from "@/server/server.ts";
export { WalletResolver } from "@/resolver/index.ts";
export { LedgerService } from "@/services/ledger.ts";
export { LoggerService } from "@/services/logger.ts";
export { IdempotencyService } from "@/services/idempotency.ts";
export {
  ItemsService,
  CATALOG_ITEMS,
  getAllItems,
  getItemById
} from "@/services/items.ts";
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

/**
 * Wallet service entry point
 *
 * Orchestrates dependency injection and server lifecycle:
 * 1. Loads environment configuration
 * 2. Initializes structured logging
 * 3. Creates database service with connection pooling
 * 4. Instantiates domain services (Ledger, Items)
 * 5. Wires up resolver with service dependencies
 * 6. Starts HTTP server with resolver injection
 * 7. Handles graceful shutdown on SIGINT/SIGTERM
 */
async function exe(): Promise<void> {
  const isProd = process.env.NODE_ENV === "production";
  const port = parseInt(process.env.PORT ?? "3000", 10);

  // Initialize logger first
  const logger = LoggerService.getInstance({
    serviceName: "wallet-api",
    isProd,
    logLevel: process.env.LOG_LEVEL
  });

  // Use DIRECT_URL for PrismaPg adapter (not Accelerate URL)
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    logger.fatal("DIRECT_URL or DATABASE_URL environment variable is required");
    process.exit(1);
  }

  logger.info("Initializing wallet service", { port, isProd });

  try {
    // Initialize database service
    logger.debug("Connecting to database...");
    const dbService = new DbService(databaseUrl, 100, 30000);
    const prisma = dbService.prismaClient;

    // Test database connection
    logger.debug("Testing database connection...");
    // eslint-disable-next-line @ts-safeql/check-sql
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection established");

    // Initialize domain services
    const ledgerService = new LedgerService(prisma);
    const itemsService = new ItemsService();
    const idempotencyService = new IdempotencyService(prisma);
    logger.debug("Domain services initialized");

    // Initialize resolver with service dependencies
    const resolver = new WalletResolver(
      ledgerService,
      itemsService,
      idempotencyService
    );

    // Initialize server and inject resolver
    const server = new WalletServer({ port, logger });
    server.setResolver(resolver);

    // Graceful shutdown handler
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await server.stop();
        logger.info("Shutdown complete");
        process.exitCode = 0;
      } catch (err) {
        process.exitCode = 1;
        logger.error("Error during shutdown", { error: err });
      }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Start server
    await server.start();
    logger.info(`Wallet API listening on port ${port}`);
  } catch (err) {
    logger.fatal("Failed to initialize wallet service", { error: err });
    process.exitCode = 1;
  }
}

exe().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
