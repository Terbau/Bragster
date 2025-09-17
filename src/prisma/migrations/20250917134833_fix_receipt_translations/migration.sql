/*
  Warnings:

  - Added the required column `darkModeLabelHexColor` to the `ReceiptItemGroupTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lightModeLabelHexColor` to the `ReceiptItemGroupTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `darkModeLabelHexColor` to the `ReceiptItemSupplementTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `ReceiptItemSupplementTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lightModeLabelHexColor` to the `ReceiptItemSupplementTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReceiptItemGroupTranslation" ADD COLUMN     "darkModeLabelHexColor" TEXT NOT NULL,
ADD COLUMN     "lightModeLabelHexColor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReceiptItemSupplementTranslation" ADD COLUMN     "darkModeLabelHexColor" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "lightModeLabelHexColor" TEXT NOT NULL;
