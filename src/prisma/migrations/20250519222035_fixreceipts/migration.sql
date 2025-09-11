/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `receiptId` on the `ReceiptItem` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `ReceiptPayment` table. All the data in the column will be lost.
  - You are about to drop the column `receiptId` on the `ReceiptPaymentGroup` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[itemId]` on the table `ReceiptPaymentGroup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `totalPrice` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemGroupId` to the `ReceiptItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentGroupId` to the `ReceiptPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `ReceiptPaymentGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReceiptItem" DROP CONSTRAINT "ReceiptItem_receiptId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptPayment" DROP CONSTRAINT "ReceiptPayment_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptPaymentGroup" DROP CONSTRAINT "ReceiptPaymentGroup_receiptId_fkey";

-- DropIndex
DROP INDEX "ReceiptItem_receiptId_idx";

-- DropIndex
DROP INDEX "ReceiptPayment_groupId_idx";

-- DropIndex
DROP INDEX "ReceiptPaymentGroup_receiptId_idx";

-- DropIndex
DROP INDEX "ReceiptPaymentGroup_receiptId_key";

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "totalAmount",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ReceiptItem" DROP COLUMN "description",
DROP COLUMN "quantity",
DROP COLUMN "receiptId",
ADD COLUMN     "itemGroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReceiptPayment" DROP COLUMN "groupId",
ADD COLUMN     "paymentGroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReceiptPaymentGroup" DROP COLUMN "receiptId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ReceiptItemGroup" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ReceiptItemGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReceiptItemGroup_receiptId_idx" ON "ReceiptItemGroup"("receiptId");

-- CreateIndex
CREATE INDEX "ReceiptItem_itemGroupId_idx" ON "ReceiptItem"("itemGroupId");

-- CreateIndex
CREATE INDEX "ReceiptPayment_paymentGroupId_idx" ON "ReceiptPayment"("paymentGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptPaymentGroup_itemId_key" ON "ReceiptPaymentGroup"("itemId");

-- CreateIndex
CREATE INDEX "ReceiptPaymentGroup_itemId_idx" ON "ReceiptPaymentGroup"("itemId");

-- AddForeignKey
ALTER TABLE "ReceiptItemGroup" ADD CONSTRAINT "ReceiptItemGroup_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ReceiptItemGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPaymentGroup" ADD CONSTRAINT "ReceiptPaymentGroup_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ReceiptItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPayment" ADD CONSTRAINT "ReceiptPayment_paymentGroupId_fkey" FOREIGN KEY ("paymentGroupId") REFERENCES "ReceiptPaymentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
