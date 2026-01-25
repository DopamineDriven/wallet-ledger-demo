/*
  Warnings:

  - You are about to drop the column `balanceAfter` on the `IdempotencyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `staleRetryCount` on the `IdempotencyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `IdempotencyRecord` table. All the data in the column will be lost.
  - The `endpoint` column on the `IdempotencyRecord` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `creditId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the `Credit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ledgerEntryId]` on the table `IdempotencyRecord` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `IdempotencyRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `LedgerEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entryType` on the `LedgerEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "ApiEndpoint" AS ENUM ('CREDITS', 'PURCHASES', 'ITEMS', 'BALANCE', 'UNKNOWN');

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_creditId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_purchaseId_fkey";

-- DropIndex
DROP INDEX "LedgerEntry_creditId_key";

-- DropIndex
DROP INDEX "LedgerEntry_purchaseId_key";

-- AlterTable
ALTER TABLE "IdempotencyRecord" DROP COLUMN "balanceAfter",
DROP COLUMN "staleRetryCount",
DROP COLUMN "updatedAt",
ADD COLUMN     "ledgerEntryId" TEXT,
ADD COLUMN     "responseBody" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "endpoint",
ADD COLUMN     "endpoint" "ApiEndpoint" NOT NULL DEFAULT 'PURCHASES';

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "creditId",
DROP COLUMN "purchaseId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "EntryStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "entryType",
ADD COLUMN     "entryType" "EntryType" NOT NULL;

-- DropTable
DROP TABLE "Credit";

-- DropTable
DROP TABLE "Purchase";

-- DropEnum
DROP TYPE "LedgerEntryType";

-- CreateTable
CREATE TABLE "CreditDetail" (
    "ledgerEntryId" TEXT NOT NULL,
    "amountAllocated" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditDetail_pkey" PRIMARY KEY ("ledgerEntryId")
);

-- CreateTable
CREATE TABLE "DebitDetail" (
    "ledgerEntryId" TEXT NOT NULL,
    "itemId" UUID NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebitDetail_pkey" PRIMARY KEY ("ledgerEntryId")
);

-- CreateIndex
CREATE INDEX "DebitDetail_itemId_idx" ON "DebitDetail"("itemId");

-- CreateIndex
CREATE INDEX "DebitDetail_itemId_createdAt_idx" ON "DebitDetail"("itemId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "IdempotencyRecord_endpoint_idx" ON "IdempotencyRecord"("endpoint");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_statusCode_idx" ON "IdempotencyRecord"("statusCode");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_key_idx" ON "IdempotencyRecord"("key");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_userId_idx" ON "IdempotencyRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_ledgerEntryId_key" ON "IdempotencyRecord"("ledgerEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_key_userId_key" ON "IdempotencyRecord"("key", "userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_idx" ON "LedgerEntry"("userId");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_entryType_idx" ON "LedgerEntry"("userId", "entryType");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_status_idx" ON "LedgerEntry"("userId", "status");

-- CreateIndex
CREATE INDEX "LedgerEntry_userId_createdAt_idx" ON "LedgerEntry"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LedgerEntry_entryType_createdAt_idx" ON "LedgerEntry"("entryType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LedgerEntry_status_createdAt_idx" ON "LedgerEntry"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "CreditDetail" ADD CONSTRAINT "CreditDetail_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebitDetail" ADD CONSTRAINT "DebitDetail_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "LedgerEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
