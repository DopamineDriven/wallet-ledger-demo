import { prismaClient } from "@/lib/prisma";

export async function testQuery() {
  const s = await prismaClient.ledgerEntry.findMany({ take: 1000 });
  return s.map(t => {
    const { amount, ...rest } = t;
    return {
      ...rest,
      amount: Number(amount)
    };
  });
}
