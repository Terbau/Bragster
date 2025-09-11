-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "merchantName" TEXT NOT NULL,
    "receiptType" TEXT,
    "receiptDate" TIMESTAMP(3),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currencyCode" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptPaymentGroup" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptPaymentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptPayment" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReceiptPaymentToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReceiptPaymentToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Receipt_userId_idx" ON "Receipt"("userId");

-- CreateIndex
CREATE INDEX "ReceiptItem_receiptId_idx" ON "ReceiptItem"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptPaymentGroup_receiptId_key" ON "ReceiptPaymentGroup"("receiptId");

-- CreateIndex
CREATE INDEX "ReceiptPaymentGroup_receiptId_idx" ON "ReceiptPaymentGroup"("receiptId");

-- CreateIndex
CREATE INDEX "ReceiptPayment_groupId_idx" ON "ReceiptPayment"("groupId");

-- CreateIndex
CREATE INDEX "_ReceiptPaymentToUser_B_index" ON "_ReceiptPaymentToUser"("B");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPaymentGroup" ADD CONSTRAINT "ReceiptPaymentGroup_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptPayment" ADD CONSTRAINT "ReceiptPayment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ReceiptPaymentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceiptPaymentToUser" ADD CONSTRAINT "_ReceiptPaymentToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ReceiptPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReceiptPaymentToUser" ADD CONSTRAINT "_ReceiptPaymentToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
