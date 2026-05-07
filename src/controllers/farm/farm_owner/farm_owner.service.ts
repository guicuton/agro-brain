import {
  FarmOwnerService,
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import {
  IFarmOwnerCreateManyParams,
  IFarmOwnerGetOneParams,
  IFarmOwnerGetRelationsParams,
  IFarmOwnerSoftDeleteParams,
  IFarmOwnerUpdateOneParams,
} from '../farm.interface';

@Injectable()
export class FarmOwnerControllerService {
  private readonly logContext = FarmOwnerControllerService.name;

  constructor(
    private readonly logger: LoggerService,
    private readonly farmOwnerService: FarmOwnerService,
  ) {}

  async getOneById(
    params: IFarmOwnerGetOneParams,
  ): Promise<IFarmOwnerGetOnePromise> {
    const { param } = params;

    const serviceResult = await this.farmOwnerService.getOneById({
      id: param.id,
    });

    return serviceResult;
  }

  async getRelationsById(
    params: IFarmOwnerGetRelationsParams,
  ): Promise<IFarmOwnerGetRelationsPromise> {
    const { param } = params;

    const serviceResult = await this.farmOwnerService.getRelationsById({
      id: param.id,
    });

    return serviceResult;
  }

  async softDeleteById(params: IFarmOwnerSoftDeleteParams): Promise<void> {
    const { ip, param, user } = params;

    const serviceResult = await this.farmOwnerService.softDeleteById({
      id: param.id,
    });

    this.logger.log(
      `[softDeleteById] - LOGINID:${user.loginId} | FARM_OWNER_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );
  }

  async updateOneById(
    params: IFarmOwnerUpdateOneParams,
  ): Promise<IFarmOwnerUpdatePromise> {
    const { body, ip, param, user } = params;

    const serviceResult = await this.farmOwnerService.updateOneById({
      data: body,
      id: param.id,
    });

    this.logger.log(
      `[updateOneById] - LOGINID:${user.loginId} | FARM_OWNER_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );

    return serviceResult;
  }

  async createMany(
    params: IFarmOwnerCreateManyParams,
  ): Promise<IFarmOwnerCreatePromise[]> {
    const { user, body, ip } = params;
    const serviceResult = await this.farmOwnerService.createMany({
      data: body.data,
    });

    for (const result of serviceResult) {
      this.logger.log(
        `[createMany] - LOGINID:${user.loginId} | FARM_OWNER_ID:${result.id} | IP:${ip}`,
        this.logContext,
      );
    }

    return serviceResult;
  }
}
