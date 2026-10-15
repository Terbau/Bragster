-- CreateEnum
CREATE TYPE "PadelRecordingStatus" AS ENUM ('UPLOADING', 'UPLOADED', 'ANALYZING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "PadelRecording" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "matchId" TEXT,
    "court" INTEGER NOT NULL,
    "matchCount" INTEGER,
    "nearTeams" JSONB NOT NULL DEFAULT '{}',
    "status" "PadelRecordingStatus" NOT NULL DEFAULT 'UPLOADING',
    "blobName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" BIGINT,
    "duration" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,
    "analysisVersion" INTEGER,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadelRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadelRally" (
    "id" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,
    "nearWinProbability" DOUBLE PRECISION NOT NULL,
    "winnerMatchId" TEXT,
    "winnerTeam" INTEGER,
    "isIgnored" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PadelRally_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PadelRecording_blobName_key" ON "PadelRecording"("blobName");

-- CreateIndex
CREATE INDEX "PadelRecording_gameId_idx" ON "PadelRecording"("gameId");

-- CreateIndex
CREATE INDEX "PadelRecording_matchId_idx" ON "PadelRecording"("matchId");

-- CreateIndex
CREATE INDEX "PadelRally_recordingId_idx" ON "PadelRally"("recordingId");

-- AddForeignKey
ALTER TABLE "PadelRecording" ADD CONSTRAINT "PadelRecording_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "PadelGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelRecording" ADD CONSTRAINT "PadelRecording_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "PadelMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelRally" ADD CONSTRAINT "PadelRally_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "PadelRecording"("id") ON DELETE CASCADE ON UPDATE CASCADE;

