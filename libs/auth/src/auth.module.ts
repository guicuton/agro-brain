import { UserModule } from '@app/user';
import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { AuthStrategyJwt } from './strategies/jwt.strategy';
import { AuthStrategyLocal } from './strategies/local.strategy';

@Global()
@Module({
  imports: [PassportModule, UserModule],
  providers: [
    AuthService,
    LocalAuthGuard,
    JwtAuthGuard,
    AuthStrategyLocal,
    AuthStrategyJwt,
  ],
  exports: [
    AuthService,
    LocalAuthGuard,
    JwtAuthGuard,
    AuthStrategyLocal,
    AuthStrategyJwt,
  ],
})
export class GlobalAuthModule {}
