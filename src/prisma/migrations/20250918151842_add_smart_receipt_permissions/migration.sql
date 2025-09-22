-- CreateEnum
CREATE TYPE "SmartReceiptAllowedPaymentEditor" AS ENUM ('OWNER', 'AUTHENTICATED_USERS', 'ANYONE');

-- AlterTable
ALTER TABLE "SmartReceipt" ADD COLUMN     "allowedPaymentEditors" "SmartReceiptAllowedPaymentEditor" NOT NULL DEFAULT 'OWNER';
