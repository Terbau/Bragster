-- CreateTable
CREATE TABLE "ReceiptItemSupplement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptItemSupplement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReceiptItemSupplement_itemId_idx" ON "ReceiptItemSupplement"("itemId");

-- AddForeignKey
ALTER TABLE "ReceiptItemSupplement" ADD CONSTRAINT "ReceiptItemSupplement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ReceiptItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
