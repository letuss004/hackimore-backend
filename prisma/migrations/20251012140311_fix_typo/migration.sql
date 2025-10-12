/*
  Warnings:

  - You are about to drop the `PharseAudio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PharseAudio" DROP CONSTRAINT "PharseAudio_phraseId_fkey";

-- DropForeignKey
ALTER TABLE "PharseAudio" DROP CONSTRAINT "PharseAudio_s3ObjectId_fkey";

-- DropTable
DROP TABLE "PharseAudio";

-- CreateTable
CREATE TABLE "PhraseAudio" (
    "id" SERIAL NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "s3ObjectId" INTEGER NOT NULL,
    "pharseMeaningId" INTEGER,
    "language" "Languages" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhraseAudio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhraseAudio" ADD CONSTRAINT "PhraseAudio_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhraseAudio" ADD CONSTRAINT "PhraseAudio_s3ObjectId_fkey" FOREIGN KEY ("s3ObjectId") REFERENCES "S3Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
