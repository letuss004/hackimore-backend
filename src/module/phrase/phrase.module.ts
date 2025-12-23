import { Module } from '@nestjs/common';
import { PhraseAudioService } from 'src/module/phrase/audio/phrase-audio.service';
import { PhraseRetryController } from 'src/module/phrase/retry/phrase-retry.controller';
import { PhraseRetryService } from 'src/module/phrase/retry/phrase-retry.service';
import { PhraseAudioController } from './audio/phrase-audio.controller';
import { PhraseController } from './phrase.controller';
import { PhraseService } from './phrase.service';

@Module({
  imports: [],
  controllers: [PhraseController, PhraseAudioController, PhraseRetryController],
  providers: [PhraseService, PhraseAudioService, PhraseRetryService],
  exports: [PhraseService, PhraseAudioService],
})
export class PhraseModule {}
