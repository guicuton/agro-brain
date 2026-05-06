import { LoggerService } from '@app/logger';
import { UserService } from '@app/user';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IAuthLoginParams,
  IAuthLoginPasswordUpdateParams,
  IAuthLoginPromise,
} from './auth.interface';

@Injectable()
export class AuthenticationControllerService {
  private readonly logContext = AuthenticationControllerService.name;
  constructor(
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(params: IAuthLoginParams): Promise<IAuthLoginPromise> {
    const { user, ip } = params;
    const { username, loginId } = user;

    const token = await this.jwtService.signAsync({
      username,
      sub: loginId,
    });

    this.logger.log(
      `[login] - LOGINID:${loginId} | IP:${ip} - SIGNIN`,
      this.logContext,
    );

    return {
      access_token: token,
    };
  }

  async update(params: IAuthLoginPasswordUpdateParams): Promise<void> {
    const { body, ip, user } = params;
    const { currentPassword, newPassword } = body;
    const { loginId } = user;

    const { id } = await this.userService.updatePassword({
      loginId,
      currentPassword,
      newPassword,
    });

    this.logger.log(`[update] - LOGINID:${id} | IP:${ip} - PASSWORD UPDATE`);
  }
}
