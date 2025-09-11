/*
  Warnings:

  - Added the required column `unitPrice` to the `ReceiptItemGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReceiptItemGroup" ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;
