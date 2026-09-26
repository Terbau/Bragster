-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "regions" JSONB;

-- AlterTable
ALTER TABLE "ReceiptItemGroup" ADD COLUMN     "regions" JSONB;

-- CreateTable
CREATE TABLE "ReceiptImage" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceiptImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptImage_receiptId_key" ON "ReceiptImage"("receiptId");

-- AddForeignKey
ALTER TABLE "ReceiptImage" ADD CONSTRAINT "ReceiptImage_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

