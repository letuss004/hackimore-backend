import { Module } from '@nestjs/common';
import { PhraseAudioService } from 'src/module/phrase/audio/phrase-audio.service';
import { PhraseMeaningService } from 'src/module/phrase/meaning/phrase-meaning.service';
import { PhraseAudioController } from './audio/phrase-audio.controller';
import { PhraseMeaningController } from './meaning/phrase-meaning.controller';
import { PhraseController } from './phrase.controller';
import { PhraseService } from './phrase.service';

@Module({
  imports: [],
  controllers: [PhraseController, PhraseMeaningController, PhraseAudioController],
  providers: [PhraseService, PhraseAudioService, PhraseMeaningService],
  exports: [PhraseService, PhraseAudioService, PhraseMeaningService],
})
export class PhraseModule {}
