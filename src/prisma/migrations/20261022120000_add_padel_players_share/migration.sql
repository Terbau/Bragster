-- CreateTable
CREATE TABLE "PadelPlayersShare" (
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PadelPlayersShare_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PadelPlayersShare_token_key" ON "PadelPlayersShare"("token");

-- AddForeignKey
ALTER TABLE "PadelPlayersShare" ADD CONSTRAINT "PadelPlayersShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
