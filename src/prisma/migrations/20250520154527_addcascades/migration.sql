-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptItem" DROP CONSTRAINT "ReceiptItem_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptItemGroup" DROP CONSTRAINT "ReceiptItemGroup_receiptId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptPayment" DROP CONSTRAINT "ReceiptPayment_paymentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ReceiptPaymentGroup" DROP CONSTRAINT "ReceiptPaymentGroup_itemId_fkey";

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItemGroup" ADD CONSTRAINT "ReceiptItemGroup_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ReceiptItemGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPaymentGroup" ADD CONSTRAINT "ReceiptPaymentGroup_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ReceiptItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPayment" ADD CONSTRAINT "ReceiptPayment_paymentGroupId_fkey" FOREIGN KEY ("paymentGroupId") REFERENCES "ReceiptPaymentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
