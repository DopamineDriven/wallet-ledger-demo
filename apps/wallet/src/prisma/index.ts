import { PrismaClient, PrismaDbService } from "@wallet-ledger/db/factory";

export class PrismaWalletService extends PrismaDbService {
  protected readonly prismaClient: PrismaClient;



  constructor(
    prisma: PrismaDbService,
    connectionString: string,
    idleTimeoutMs = 30000,
    poolMax = 100
  ) {
    super({
      connectionString:
        prisma.dbOpts.connectionString.length > 1
          ? prisma.dbOpts.connectionString
          : connectionString,
      idleTimeoutMs,
      poolMax
    });
    this.prismaClient = prisma.p(false);
  }
}
