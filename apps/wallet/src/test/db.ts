import { randomUUID } from "node:crypto";
import { Fs } from "@d0paminedriven/fs";
import * as dotenv from "dotenv";
import type { DX } from "@wallet-ledger/types";

const fs = new Fs(process.cwd());

dotenv.config({ quiet: true });

type RTShape<T extends boolean = boolean> = DX<
  {
    creditDetail: {
      createdAt: Date;
      amountAllocated: T extends false ? bigint : number;
      ledgerEntryId: string;
    } | null;
  } & {
    id: string;
    userId: string;
    entryType: "CREDIT" | "DEBIT";
    status: "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
    amount: T extends false ? bigint : number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
>;

function handleBigInt<const V extends boolean = boolean>(props: RTShape<V>) {
  const { creditDetail: credit, ...rest } = props;
  if (!credit?.amountAllocated) return;
  if (typeof credit.amountAllocated === "bigint") {
    const { amountAllocated: amount, ...credRest } = credit;
    const toInt = Number(amount);
    const cred = { amountAllocated: toInt, ...credRest } as const;
    return {
      ...rest,
      amount:
        typeof rest.amount === "bigint" ? Number(rest.amount) : rest.amount,
      creditDetail: { ...cred }
    } as const satisfies RTShape<true>;
  } else {
    return {
      ...rest,
      amount:
        typeof rest.amount === "bigint" ? Number(rest.amount) : rest.amount,
      creditDetail: {
        ...credit,
        amountAllocated: credit.amountAllocated
      }
    } as const satisfies RTShape<true>;
  }
}

function safeErrMsg(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  } else if (typeof err === "object" && err != null) {
    return JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
  } else if (typeof err === "string") {
    return err;
  } else if (typeof err === "number") {
    return err.toPrecision(5);
  } else if (typeof err === "boolean") {
    return `${err}`;
  } else return String(err);
}

async function _connectTest() {
  const { DbService } = await import("@wallet-ledger/db/node");
  const { prismaClient } = new DbService(process.env.DATABASE_URL ?? "");
  const uuid = randomUUID();
  try {
    prismaClient.$connect();

    const q = await prismaClient.ledgerEntry.create({
      data: {
        amount: 10000n,
        entryType: "CREDIT",
        userId: uuid,
        createdAt: new Date(),
        creditDetail: {
          create: { amountAllocated: 10000n, createdAt: new Date() }
        }
      },
      include: { creditDetail: true }
    });

    if (q.userId === uuid) {
      fs.withWs(``, JSON.stringify(handleBigInt(q), null, 2));
    }
  } catch (err) {
    throw new Error(safeErrMsg(err));
  }
}
