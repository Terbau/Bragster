-- CreateTable
CREATE TABLE "PadelGame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courts" INTEGER NOT NULL,
    "pointsPerMatch" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadelGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadelPlayer" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PadelPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadelRound" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PadelRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadelMatch" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "court" INTEGER NOT NULL,
    "team1" TEXT[],
    "team2" TEXT[],
    "team1Score" INTEGER,
    "team2Score" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadelMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PadelGame_userId_idx" ON "PadelGame"("userId");

-- CreateIndex
CREATE INDEX "PadelPlayer_gameId_idx" ON "PadelPlayer"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PadelPlayer_gameId_name_key" ON "PadelPlayer"("gameId", "name");

-- CreateIndex
CREATE INDEX "PadelRound_gameId_idx" ON "PadelRound"("gameId");

-- CreateIndex
CREATE INDEX "PadelMatch_roundId_idx" ON "PadelMatch"("roundId");

-- AddForeignKey
ALTER TABLE "PadelGame" ADD CONSTRAINT "PadelGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelPlayer" ADD CONSTRAINT "PadelPlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "PadelGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelRound" ADD CONSTRAINT "PadelRound_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "PadelGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelMatch" ADD CONSTRAINT "PadelMatch_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "PadelRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

