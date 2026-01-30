
// import { DbServiceAccelerate } from "@wallet-ledger/db/db-accelerate";
import { PrismaDbService } from "@wallet-ledger/db/factory";
// import { DbService } from "@wallet-ledger/db/node";

// function prismaClientSingleton(
//   withAccelerate?: false
// ): (typeof DbService)["prototype"]["prismaClient"];
// function prismaClientSingleton(
//   withAccelerate: true
// ): (typeof DbServiceAccelerate)["prototype"]["prismaClient"];
function prismaClientSingleton<const T extends boolean = false>(withAccelerate = false as T) {
  const pc = new PrismaDbService({
    connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? "",
    idleTimeoutMs: 30000,
    poolMax: 100
  });
  if (withAccelerate) {
    return pc.p(true);
  } else {
    return pc.p(true);
  }
}

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton>;
}

export const prismaClient = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismaClient;

export type PrismaClientWithAccelerate = typeof prismaClient;
