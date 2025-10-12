/*
  Warnings:

  - You are about to drop the column `pharseMeaningId` on the `PhraseAudio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PhraseAudio" DROP COLUMN "pharseMeaningId",
ADD COLUMN     "phraseMeaningId" INTEGER;

-- AlterTable
ALTER TABLE "S3Object" ADD COLUMN     "filename" TEXT,
ADD COLUMN     "mimetype" TEXT,
ADD COLUMN     "originalname" TEXT,
ADD COLUMN     "size" INTEGER;
