-- AlterEnum
ALTER TYPE "PadelFormat" ADD VALUE 'ELO_AMERICANO';

-- AlterTable
ALTER TABLE "PadelPlayer" ADD COLUMN     "sitsOutMore" BOOLEAN NOT NULL DEFAULT false;

