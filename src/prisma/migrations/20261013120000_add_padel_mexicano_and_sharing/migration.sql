-- CreateEnum
CREATE TYPE "PadelFormat" AS ENUM ('AMERICANO', 'MEXICANO');

-- AlterTable
ALTER TABLE "PadelGame" ADD COLUMN     "courtNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "format" "PadelFormat" NOT NULL DEFAULT 'AMERICANO',
ADD COLUMN     "plannedRounds" INTEGER,
ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PadelGame_shareToken_key" ON "PadelGame"("shareToken");
