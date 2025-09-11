-- AlterTable
ALTER TABLE "ReceiptItemGroup" ADD COLUMN     "quantityUnit" TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
