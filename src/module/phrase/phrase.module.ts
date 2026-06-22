import { Module } from '@nestjs/common';
import { PhraseAudioService } from 'src/module/phrase/audio/phrase-audio.service';
import { PhraseAudioRatingController } from 'src/module/phrase/rating/phrase-audio-rating.controller';
import { PhraseAudioRatingService } from 'src/module/phrase/rating/phrase-audio-rating.service';
import { PhraseRetryController } from 'src/module/phrase/retry/phrase-retry.controller';
import { PhraseRetryService } from 'src/module/phrase/retry/phrase-retry.service';
import { PhraseAudioController } from './audio/phrase-audio.controller';
import { PhraseController } from './phrase.controller';
import { PhraseService } from './phrase.service';

@Module({
  imports: [],
  controllers: [
    PhraseController,
    PhraseAudioController,
    PhraseRetryController,
    PhraseAudioRatingController,
  ],
  providers: [
    PhraseService,
    PhraseAudioService,
    PhraseRetryService,
    PhraseAudioRatingService,
  ],
  exports: [],
})
export class PhraseModule {}
