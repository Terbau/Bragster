-- CreateTable
CREATE TABLE "SmartReceiptGuest" (
    "id" TEXT NOT NULL,
    "smartReceiptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartReceiptGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartReceiptGuestPayment" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "smartReceiptId" TEXT NOT NULL,
    "receiptItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartReceiptGuestPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmartReceiptGuest_smartReceiptId_idx" ON "SmartReceiptGuest"("smartReceiptId");

-- CreateIndex
CREATE UNIQUE INDEX "SmartReceiptGuest_smartReceiptId_name_key" ON "SmartReceiptGuest"("smartReceiptId", "name");

-- CreateIndex
CREATE INDEX "SmartReceiptGuestPayment_guestId_idx" ON "SmartReceiptGuestPayment"("guestId");

-- AddForeignKey
ALTER TABLE "SmartReceiptGuest" ADD CONSTRAINT "SmartReceiptGuest_smartReceiptId_fkey" FOREIGN KEY ("smartReceiptId") REFERENCES "SmartReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptGuestPayment" ADD CONSTRAINT "SmartReceiptGuestPayment_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "SmartReceiptGuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptGuestPayment" ADD CONSTRAINT "SmartReceiptGuestPayment_smartReceiptId_fkey" FOREIGN KEY ("smartReceiptId") REFERENCES "SmartReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptGuestPayment" ADD CONSTRAINT "SmartReceiptGuestPayment_receiptItemId_fkey" FOREIGN KEY ("receiptItemId") REFERENCES "ReceiptItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
