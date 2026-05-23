-- CreateEnum
CREATE TYPE "PhraseStatus" AS ENUM ('Active', 'Master');

-- AlterTable
ALTER TABLE "Phrase" ADD COLUMN     "status" "PhraseStatus" NOT NULL DEFAULT 'Active';
