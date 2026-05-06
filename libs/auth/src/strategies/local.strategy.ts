import { LoggerService } from '@app/logger';
import { UserService } from '@app/user';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { IAuthenticatedUser } from './strategies.interface';

@Injectable()
export class AuthStrategyLocal extends PassportStrategy(Strategy) {
  private readonly logContext = AuthStrategyLocal.name;

  constructor(
    private userService: UserService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<IAuthenticatedUser> {
    if (!username || !password) throw new UnauthorizedException();

    const user = await this.userService.validateLogin({
      username,
    });

    const validatePassword = this.userService.validatePassword({
      userPassword: password,
      hashPassword: user.password,
    });

    if (validatePassword) {
      return {
        username,
        loginId: user.id,
      } satisfies IAuthenticatedUser;
    }

    this.logger.warn(
      `[AUTH] - USERNAME:${username} | INVALID DATA`,
      this.logContext,
    );
    throw new UnauthorizedException();
  }
}
