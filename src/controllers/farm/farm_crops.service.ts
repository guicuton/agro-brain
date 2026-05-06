import {
  FarmCropsService,
  IFarmCropsCreatePromise,
  IFarmCropsGetOnePromise,
  IFarmCropsUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import {
  IFarmCropsCreateManyParams,
  IFarmCropsGetOneParams,
  IFarmCropsSoftDeleteParams,
  IFarmCropsUpdateOneParams,
} from './farm.interface';

@Injectable()
export class FarmCropsControllerService {
  private readonly logContext = FarmCropsControllerService.name;

  constructor(
    private readonly logger: LoggerService,
    private readonly farmCropsService: FarmCropsService,
  ) {}

  async getOneById(
    params: IFarmCropsGetOneParams,
  ): Promise<IFarmCropsGetOnePromise> {
    const { param } = params;

    const serviceResult = await this.farmCropsService.getOneById({
      id: param.id,
    });

    return serviceResult;
  }

  async softDeleteById(params: IFarmCropsSoftDeleteParams): Promise<void> {
    const { ip, param, user } = params;

    const serviceResult = await this.farmCropsService.softDeleteById({
      id: param.id,
    });

    this.logger.log(
      `[softDeleteById] - LOGINID:${user.loginId} | FARM_CROPS_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );
  }

  async updateOneById(
    params: IFarmCropsUpdateOneParams,
  ): Promise<IFarmCropsUpdatePromise> {
    const { body, ip, param, user } = params;

    const serviceResult = await this.farmCropsService.updateOneById({
      data: body,
      id: param.id,
    });

    this.logger.log(
      `[updateOneById] - LOGINID:${user.loginId} | FARM_CROPS_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );

    return serviceResult;
  }

  async createMany(
    params: IFarmCropsCreateManyParams,
  ): Promise<IFarmCropsCreatePromise[]> {
    const { user, body, ip } = params;
    const serviceResult = await this.farmCropsService.createMany({
      data: body.data,
    });

    for (const result of serviceResult) {
      this.logger.log(
        `[createMany] - LOGINID:${user.loginId} | FARM_CROPS_ID:${result.id} | IP:${ip}`,
        this.logContext,
      );
    }

    return serviceResult;
  }
}
