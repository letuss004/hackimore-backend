import { DefaultJobOptions } from 'bullmq';

export const JOB_DEFAULT_OPTIONS: DefaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: false,
  removeOnFail: false,
  keepLogs: 1000,
};
