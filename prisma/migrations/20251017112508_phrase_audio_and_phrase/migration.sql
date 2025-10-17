/*
  Warnings:

  - You are about to drop the column `phraseMeaningId` on the `PhraseAudio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Phrase" ADD COLUMN     "description" TEXT,
ALTER COLUMN "language" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PhraseAudio" DROP COLUMN "phraseMeaningId",
ALTER COLUMN "language" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PhraseMeaning" ALTER COLUMN "language" DROP NOT NULL;
