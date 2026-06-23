-- CreateTable
CREATE TABLE "PhraseAudioRating" (
    "id" SERIAL NOT NULL,
    "phraseAudioId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhraseAudioRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhraseAudioRating" ADD CONSTRAINT "PhraseAudioRating_phraseAudioId_fkey" FOREIGN KEY ("phraseAudioId") REFERENCES "PhraseAudio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
