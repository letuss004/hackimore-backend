import { Languages } from '@prisma/client';

export interface RandomSchedule {
  languages: Languages[];
  scheduledIds: number[];
  basePosition: number;
  count: number;
}
