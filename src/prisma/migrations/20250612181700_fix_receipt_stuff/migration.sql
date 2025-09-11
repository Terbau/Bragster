/*
  Warnings:

  - You are about to drop the `ReceiptPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReceiptPaymentGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ReceiptPaymentToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReceiptPayment" DROP CONSTRAINT "ReceiptPayment_paymentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptPaymentGroup" DROP CONSTRAINT "ReceiptPaymentGroup_itemId_fkey";

-- DropForeignKey
ALTER TABLE "_ReceiptPaymentToUser" DROP CONSTRAINT "_ReceiptPaymentToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ReceiptPaymentToUser" DROP CONSTRAINT "_ReceiptPaymentToUser_B_fkey";

-- DropTable
DROP TABLE "ReceiptPayment";

-- DropTable
DROP TABLE "ReceiptPaymentGroup";

-- DropTable
DROP TABLE "_ReceiptPaymentToUser";

-- CreateTable
CREATE TABLE "CollectiveReceipt" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectiveReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectiveReceiptPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectiveReceiptId" TEXT NOT NULL,
    "receiptItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectiveReceiptPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectiveReceiptToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectiveReceiptToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CollectiveReceipt_receiptId_idx" ON "CollectiveReceipt"("receiptId");

-- CreateIndex
CREATE INDEX "_CollectiveReceiptToUser_B_index" ON "_CollectiveReceiptToUser"("B");

-- AddForeignKey
ALTER TABLE "CollectiveReceipt" ADD CONSTRAINT "CollectiveReceipt_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectiveReceiptPayment" ADD CONSTRAINT "CollectiveReceiptPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectiveReceiptPayment" ADD CONSTRAINT "CollectiveReceiptPayment_collectiveReceiptId_fkey" FOREIGN KEY ("collectiveReceiptId") REFERENCES "CollectiveReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectiveReceiptPayment" ADD CONSTRAINT "CollectiveReceiptPayment_receiptItemId_fkey" FOREIGN KEY ("receiptItemId") REFERENCES "ReceiptItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectiveReceiptToUser" ADD CONSTRAINT "_CollectiveReceiptToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CollectiveReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectiveReceiptToUser" ADD CONSTRAINT "_CollectiveReceiptToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
