import type { DX, SerializeBigInts } from "@/utils.ts";
import type {
  CreditDetail,
  DebitDetail,
  IdempotencyRecord,
  LedgerEntry
} from "@wallet-ledger/db/node/generated/client";

export type LedgerEntrySingleton<T extends boolean = false> = DX<
  SerializeBigInts<LedgerEntry, T> & {
    creditDetail?: CreditDetailSingleton<T>;
    debitDetail?: DebitDetailSingleton<T>;
    idempotency?: IdempotencySingleton<T>;
  }
>;

export type DebitDetailSingleton<T extends boolean = false> = DX<
  SerializeBigInts<DebitDetail, T> & {
    ledgerEntry?: LedgerEntrySingleton<T>;
  }
>;
export type CreditDetailSingleton<T extends boolean = false> = DX<
  SerializeBigInts<CreditDetail, T> & {
    ledgerEntry?: LedgerEntrySingleton<T>;
  }
>;

export type IdempotencySingleton<T extends boolean = false> = DX<
  IdempotencyRecord & {
    ledgerEntry?: LedgerEntrySingleton<T>;
  }
>;
