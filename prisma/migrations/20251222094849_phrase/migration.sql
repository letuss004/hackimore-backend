/*
  Warnings:

  - You are about to drop the column `hint` on the `Phrase` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `PhraseAudio` table. All the data in the column will be lost.
  - You are about to drop the `PhraseMeaning` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PhraseMeaning" DROP CONSTRAINT "PhraseMeaning_phraseId_fkey";

-- DropForeignKey
ALTER TABLE "Redemption" DROP CONSTRAINT "Redemption_userId_fkey";

-- AlterTable
ALTER TABLE "Phrase" DROP COLUMN "hint",
ADD COLUMN     "context" TEXT,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "PhraseAudio" DROP COLUMN "language",
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "PhraseMeaning";

-- CreateTable
CREATE TABLE "PhraseRetry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "phraseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhraseRetry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhraseRetry" ADD CONSTRAINT "PhraseRetry_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
