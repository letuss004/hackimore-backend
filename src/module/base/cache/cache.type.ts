import { Callback } from 'ioredis/built/types';
import { RedisKey } from 'ioredis/built/utils/RedisCommander';

export interface SetValueArgs {
  key: RedisKey;
  value: string | Buffer | number;
  expired?: number; // in seconds
}

export interface SetStringifyArgs {
  key: RedisKey;
  value: string | Buffer | number | object;
  expired?: number; // in seconds
}

export interface GetJsonParsedArgs {
  key: RedisKey;
}

export interface GetValueArgs {
  key: RedisKey;
}
