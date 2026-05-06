import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database.service';
import {
  ILoginCreateOneParams,
  ILoginCreateOnePromise,
  ILoginFindFirstParams,
  ILoginFindFirstPromise,
  ILoginUpdatePasswordParams,
  ILoginUpdatePasswordPromise,
} from './repository.interface';

@Injectable()
export class LoginRepository {
  constructor(private readonly repository: DatabaseService) {}

  async createOne(
    params: ILoginCreateOneParams,
  ): Promise<ILoginCreateOnePromise | void> {
    const promise = await this.repository.login
      .create({
        data: params,
        select: {
          id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async findOneById(id: string): Promise<ILoginFindFirstPromise | void> {
    const promise = await this.repository.login
      .findUnique({
        where: { id },
        select: {
          id: true,
          password: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async findOneByUsernameOrEmail(
    params: ILoginFindFirstParams,
  ): Promise<ILoginFindFirstPromise | void> {
    const promise = await this.repository.login
      .findFirst({
        where: params,
        select: {
          id: true,
          password: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async updatePasswordById(
    params: ILoginUpdatePasswordParams,
  ): Promise<ILoginUpdatePasswordPromise | void> {
    const { passwordHash, loginId } = params;
    const promise = await this.repository.login
      .update({
        data: {
          password: passwordHash,
        },
        where: {
          id: loginId,
        },
        select: {
          id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }
}
