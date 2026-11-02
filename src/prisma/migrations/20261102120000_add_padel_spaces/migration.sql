-- Padel games, players and ratings move from the user to a space. Every user
-- with padel games gets a space with them, and keeps the live link to their
-- players. brage.baugerod@online.ntnu.no's space is called "Brage's space".

-- CreateTable
CREATE TABLE "PadelSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadelSpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadelSpaceHost" (
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PadelSpaceHost_pkey" PRIMARY KEY ("spaceId","userId")
);

-- CreateTable
CREATE TABLE "PadelPlayerLink" (
    "spaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PadelPlayerLink_pkey" PRIMARY KEY ("spaceId","key")
);

-- CreateIndex
CREATE UNIQUE INDEX "PadelSpace_shareToken_key" ON "PadelSpace"("shareToken");

-- CreateIndex
CREATE INDEX "PadelSpace_ownerId_idx" ON "PadelSpace"("ownerId");

-- CreateIndex
CREATE INDEX "PadelSpaceHost_userId_idx" ON "PadelSpaceHost"("userId");

-- CreateIndex
CREATE INDEX "PadelPlayerLink_userId_idx" ON "PadelPlayerLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PadelPlayerLink_spaceId_userId_key" ON "PadelPlayerLink"("spaceId", "userId");

-- AddForeignKey
ALTER TABLE "PadelSpace" ADD CONSTRAINT "PadelSpace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelSpaceHost" ADD CONSTRAINT "PadelSpaceHost_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "PadelSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelSpaceHost" ADD CONSTRAINT "PadelSpaceHost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelPlayerLink" ADD CONSTRAINT "PadelPlayerLink_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "PadelSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelPlayerLink" ADD CONSTRAINT "PadelPlayerLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One space for every user with padel games or a shared players list
INSERT INTO "PadelSpace" ("id", "name", "ownerId", "shareToken", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    CASE
        WHEN lower(u."email") = 'brage.baugerod@online.ntnu.no' THEN 'Brage''s space'
        ELSE split_part(u."email", '@', 1) || '''s space'
    END,
    u."id",
    s."token",
    COALESCE(
        (SELECT min(g."createdAt") FROM "PadelGame" g WHERE g."userId" = u."id"),
        CURRENT_TIMESTAMP
    ),
    CURRENT_TIMESTAMP
FROM "User" u
LEFT JOIN "PadelPlayersShare" s ON s."userId" = u."id"
WHERE s."userId" IS NOT NULL
   OR EXISTS (SELECT 1 FROM "PadelGame" g WHERE g."userId" = u."id");

-- AlterTable: games belong to a space, and stay when their creator is deleted
ALTER TABLE "PadelGame" ADD COLUMN "spaceId" TEXT;

UPDATE "PadelGame" g
SET "spaceId" = sp."id"
FROM "PadelSpace" sp
WHERE sp."ownerId" = g."userId";

ALTER TABLE "PadelGame" ALTER COLUMN "spaceId" SET NOT NULL;
ALTER TABLE "PadelGame" ALTER COLUMN "userId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "PadelGame" DROP CONSTRAINT "PadelGame_userId_fkey";

-- AddForeignKey
ALTER TABLE "PadelGame" ADD CONSTRAINT "PadelGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PadelGame" ADD CONSTRAINT "PadelGame_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "PadelSpace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PadelGame_spaceId_idx" ON "PadelGame"("spaceId");

-- The live link to the players moved to the space
DROP TABLE "PadelPlayersShare";
