-- CreateTable
CREATE TABLE "ReceiptItemGroupTranslation" (
    "id" TEXT NOT NULL,
    "itemGroupId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptItemGroupTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItemSupplementTranslation" (
    "id" TEXT NOT NULL,
    "supplementId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptItemSupplementTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReceiptItemGroupTranslation_itemGroupId_idx" ON "ReceiptItemGroupTranslation"("itemGroupId");

-- CreateIndex
CREATE INDEX "ReceiptItemSupplementTranslation_supplementId_idx" ON "ReceiptItemSupplementTranslation"("supplementId");

-- AddForeignKey
ALTER TABLE "ReceiptItemGroupTranslation" ADD CONSTRAINT "ReceiptItemGroupTranslation_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ReceiptItemGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItemSupplementTranslation" ADD CONSTRAINT "ReceiptItemSupplementTranslation_supplementId_fkey" FOREIGN KEY ("supplementId") REFERENCES "ReceiptItemSupplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
