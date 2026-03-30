import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@server/errors';
import { Redis } from 'ioredis';
import { isPrimitive } from 'src/common/helpers/object';
import { isRawJSON } from 'src/common/helpers/string';
import {
  GetJsonParsedArgs,
  GetValueArgs,
  SetStringifyArgs,
  SetValueArgs,
} from 'src/module/base/cache/cache.type';

@Injectable()
export class CacheService {
  constructor(
    @InjectRedis()
    public readonly redis: Redis,
  ) {}

  public async setValue(args: SetValueArgs) {
    if (args.expired) {
      return this.redis.setex(args.key, args.expired, args.value, args.callback);
    }
    return this.redis.set(args.key, args.value, args.callback);
  }

  public async getValue(args: GetValueArgs) {
    return this.redis.get(args.key, args.callback);
  }

  public async setStringify(args: SetStringifyArgs) {
    if (isPrimitive(args.value)) {
      throw new ValidationError(
        `CacheService.setStringify: value is primitive, can't stringify`,
      );
    }
    return this.setValue({ ...args, value: JSON.stringify(args.value) });
  }

  public async getJsonParsed<T>(args: GetJsonParsedArgs): Promise<T> {
    const rawString = await this.getValue(args);
    if (!isRawJSON(rawString)) {
      return null;
    }
    return JSON.parse(rawString);
  }
}
