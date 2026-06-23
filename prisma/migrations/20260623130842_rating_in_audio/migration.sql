/*
  Warnings:

  - You are about to drop the `PhraseAudioRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PhraseAudioRating" DROP CONSTRAINT "PhraseAudioRating_phraseAudioId_fkey";

-- AlterTable
ALTER TABLE "PhraseAudio" ADD COLUMN     "rating" INTEGER;

-- DropTable
DROP TABLE "PhraseAudioRating";
