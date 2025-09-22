-- CreateTable
CREATE TABLE "SmartReceiptInviteLink" (
    "id" TEXT NOT NULL,
    "smartReceiptId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "SmartReceiptInviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmartReceiptInviteLink_smartReceiptId_idx" ON "SmartReceiptInviteLink"("smartReceiptId");

-- AddForeignKey
ALTER TABLE "SmartReceiptInviteLink" ADD CONSTRAINT "SmartReceiptInviteLink_smartReceiptId_fkey" FOREIGN KEY ("smartReceiptId") REFERENCES "SmartReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartReceiptInviteLink" ADD CONSTRAINT "SmartReceiptInviteLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
