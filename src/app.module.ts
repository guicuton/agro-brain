import { GlobalAuthModule } from '@app/auth';
import { GlobalCacheModule } from '@app/cache';
import { GlobalDatabaseModule } from '@app/database';
import { FarmModule } from '@app/farm';
import { GlobalLoggerModule } from '@app/logger';
import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { config } from '../configurations/scripts/config';
import { DEFAULT_TTL, ThrottleLimits } from '../utils/constants';
import { AuthenticationController } from './controllers/auth/auth.controller';
import { AuthenticationControllerService } from './controllers/auth/auth.service';
import { FarmOwnerController } from './controllers/farm/farm_owner.controller';
import { FarmOwnerControllerService } from './controllers/farm/farm_owner.service';
import { FarmPropertyController } from './controllers/farm/farm_property.controller';
import { FarmPropertyControllerService } from './controllers/farm/farm_property.service';
import { FarmHarvestController } from './controllers/farm/farm_harvest.controller';
import { FarmHarvestControllerService } from './controllers/farm/farm_harvest.service';
import { FarmCropsController } from './controllers/farm/farm_crops.controller';
import { FarmCropsControllerService } from './controllers/farm/farm_crops.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/configurations/envs/.env.${process.env.NODE_ENV}`,
      load: [config],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (cs: ConfigService) => {
        const secret = cs.get<string>('JWT_SECRET');
        if (!secret) throw new Error('invalid_jwt_secret');

        return {
          secret: cs.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: DEFAULT_TTL.quarter,
          },
        };
      },
      global: true,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([ThrottleLimits.default]),
    GlobalLoggerModule,
    GlobalCacheModule,
    GlobalDatabaseModule,
    GlobalAuthModule,
    UserModule,
    FarmModule,
  ],
  controllers: [
    AuthenticationController,
    FarmOwnerController,
    FarmPropertyController,
    FarmHarvestController,
    FarmCropsController,
  ],
  providers: [
    AuthenticationControllerService,
    FarmOwnerControllerService,
    FarmPropertyControllerService,
    FarmHarvestControllerService,
    FarmCropsControllerService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
