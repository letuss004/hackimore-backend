/*
  Warnings:

  - You are about to drop the `Storage` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('English', 'Vietnamese', 'Chinese');

-- CreateEnum
CREATE TYPE "StorageService" AS ENUM ('Local', 'S3');

-- DropTable
DROP TABLE "Storage";

-- DropEnum
DROP TYPE "LabelType";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "ProjectPrivacy";

-- DropEnum
DROP TYPE "ProjectRole";

-- DropEnum
DROP TYPE "ProjectStatus";

-- DropEnum
DROP TYPE "WorkStatus";

-- DropEnum
DROP TYPE "WorkingStatus";

-- CreateTable
CREATE TABLE "S3Object" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "eTag" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "S3Object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phrase" (
    "id" SERIAL NOT NULL,
    "language" "Languages" NOT NULL,
    "content" TEXT NOT NULL,
    "hint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Phrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhraseMeaning" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "language" "Languages" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhraseMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharseAudio" (
    "id" SERIAL NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "s3ObjectId" INTEGER NOT NULL,
    "pharseMeaningId" INTEGER,
    "language" "Languages" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PharseAudio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhraseMeaning_key_key" ON "PhraseMeaning"("key");

-- AddForeignKey
ALTER TABLE "PhraseMeaning" ADD CONSTRAINT "PhraseMeaning_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharseAudio" ADD CONSTRAINT "PharseAudio_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "Phrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharseAudio" ADD CONSTRAINT "PharseAudio_s3ObjectId_fkey" FOREIGN KEY ("s3ObjectId") REFERENCES "S3Object"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
