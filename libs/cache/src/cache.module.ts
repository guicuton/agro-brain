import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheModuleServices } from './cache.service';

const RedisClientProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (cs: ConfigService) => {
    return new Redis({
      host: cs.get('CACHE.REDIS.HOST'),
      port: cs.get('CACHE.REDIS.PORT'),
      password: cs.get('CACHE.REDIS.PASS'),
    });
  },
};

@Global()
@Module({
  providers: [CacheModuleServices, RedisClientProvider],
  exports: [CacheModuleServices, RedisClientProvider],
})
export class GlobalCacheModule {}
