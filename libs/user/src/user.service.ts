import { CacheModuleServices } from '@app/cache';
import { ILoginUpdatePasswordPromise, LoginRepository } from '@app/database';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DEFAULT_TTL } from '../../../utils/constants';
import {
  IUserCreateParams,
  IUserCreatePromise,
  IUserUpdatePasswordParams,
  IUserValidateLoginParams,
  IUserValidateLoginPromise,
  IUserValidatePasswordParams,
} from './user.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly cache: CacheModuleServices,
    private readonly repository: LoginRepository,
  ) {}

  async createOne(params: IUserCreateParams): Promise<IUserCreatePromise> {
    const { username, password, email } = params;
    const passwordHash = bcrypt.hashSync(password, 10);

    const repositoryResult = await this.repository.createOne({
      username,
      email,
      password: passwordHash,
      created_at: new Date(),
    });

    if (repositoryResult) {
      return repositoryResult;
    }

    throw new UnauthorizedException();
  }

  async updatePassword(
    params: IUserUpdatePasswordParams,
  ): Promise<ILoginUpdatePasswordPromise> {
    const { loginId, currentPassword, newPassword } = params;
    const repositoryResult = await this.repository.findOneById(loginId);

    if (!repositoryResult) throw new UnauthorizedException();

    if (
      !this.validatePassword({
        userPassword: currentPassword,
        hashPassword: repositoryResult.password,
      })
    ) {
      throw new UnauthorizedException();
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    const repositoryUpdateResult = await this.repository.updatePasswordById({
      loginId,
      passwordHash: newPasswordHash,
    });

    if (!repositoryUpdateResult) throw new UnauthorizedException();

    await this.cache.deleteCollection('auth:*');
    return repositoryUpdateResult;
  }

  async validateLogin(
    params: IUserValidateLoginParams,
  ): Promise<IUserValidateLoginPromise> {
    const { username } = params;

    const cacheKey = 'auth';
    const cacheItem = username;
    const cache = await this.cache.get<IUserValidateLoginPromise>({
      key: cacheKey,
      item: cacheItem,
    });

    if (cache) return cache;

    const repositoryResult =
      await this.repository.findOneByUsernameOrEmail(params);

    if (repositoryResult) {
      await this.cache.set({
        key: cacheKey,
        item: cacheItem,
        data: repositoryResult,
        ttl: DEFAULT_TTL.five,
      });
      return repositoryResult;
    }

    throw new UnauthorizedException();
  }

  validatePassword(params: IUserValidatePasswordParams): boolean {
    const { hashPassword, userPassword } = params;
    return bcrypt.compareSync(userPassword, hashPassword);
  }
}
