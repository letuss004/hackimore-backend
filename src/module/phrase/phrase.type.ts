import { Languages } from '@prisma/client';

export interface RandomSchedule {
  languages: Languages[];
  scheduled: number[];
  basePosition: number;
  count: number;
}
