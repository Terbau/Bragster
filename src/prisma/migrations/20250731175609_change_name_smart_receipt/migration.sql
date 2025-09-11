/*
  Warnings:

  - You are about to drop the `CollectiveReceipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectiveReceiptPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CollectiveReceiptToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CollectiveReceipt" DROP CONSTRAINT "CollectiveReceipt_receiptId_fkey";

-- DropForeignKey
ALTER TABLE "CollectiveReceiptPayment" DROP CONSTRAINT "CollectiveReceiptPayment_collectiveReceiptId_fkey";

-- DropForeignKey
ALTER TABLE "CollectiveReceiptPayment" DROP CONSTRAINT "CollectiveReceiptPayment_receiptItemId_fkey";

-- DropForeignKey
ALTER TABLE "CollectiveReceiptPayment" DROP CONSTRAINT "CollectiveReceiptPayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CollectiveReceiptToUser" DROP CONSTRAINT "_CollectiveReceiptToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectiveReceiptToUser" DROP CONSTRAINT "_CollectiveReceiptToUser_B_fkey";

-- DropTable
DROP TABLE "CollectiveReceipt";

-- DropTable
DROP TABLE "CollectiveReceiptPayment";

-- DropTable
DROP TABLE "_CollectiveReceiptToUser";

-- CreateTable
CREATE TABLE "SmartReceipt" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartReceiptPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "smartReceiptId" TEXT NOT NULL,
    "receiptItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartReceiptPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SmartReceiptToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SmartReceiptToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "SmartReceipt_receiptId_idx" ON "SmartReceipt"("receiptId");

-- CreateIndex
CREATE INDEX "_SmartReceiptToUser_B_index" ON "_SmartReceiptToUser"("B");

-- AddForeignKey
ALTER TABLE "SmartReceipt" ADD CONSTRAINT "SmartReceipt_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptPayment" ADD CONSTRAINT "SmartReceiptPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptPayment" ADD CONSTRAINT "SmartReceiptPayment_smartReceiptId_fkey" FOREIGN KEY ("smartReceiptId") REFERENCES "SmartReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptPayment" ADD CONSTRAINT "SmartReceiptPayment_receiptItemId_fkey" FOREIGN KEY ("receiptItemId") REFERENCES "ReceiptItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SmartReceiptToUser" ADD CONSTRAINT "_SmartReceiptToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "SmartReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SmartReceiptToUser" ADD CONSTRAINT "_SmartReceiptToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
