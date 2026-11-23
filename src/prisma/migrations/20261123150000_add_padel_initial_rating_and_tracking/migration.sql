-- AlterTable
ALTER TABLE "PadelGame" ADD COLUMN "trackRatings" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PadelPlayer" ADD COLUMN "initialRating" INTEGER;
