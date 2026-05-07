import {
  FarmHarvestService,
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import {
  IFarmHarvestCreateManyParams,
  IFarmHarvestGetOneParams,
  IFarmHarvestGetRelationsParams,
  IFarmHarvestSoftDeleteParams,
  IFarmHarvestUpdateOneParams,
} from '../farm.interface';

@Injectable()
export class FarmHarvestControllerService {
  private readonly logContext = FarmHarvestControllerService.name;

  constructor(
    private readonly logger: LoggerService,
    private readonly farmHarvestService: FarmHarvestService,
  ) {}

  async getOneById(
    params: IFarmHarvestGetOneParams,
  ): Promise<IFarmHarvestGetOnePromise> {
    const { param } = params;

    const serviceResult = await this.farmHarvestService.getOneById({
      id: param.id,
    });

    return serviceResult;
  }

  async getRelationsById(
    params: IFarmHarvestGetRelationsParams,
  ): Promise<IFarmHarvestGetRelationsPromise> {
    const { param } = params;

    const serviceResult = await this.farmHarvestService.getRelationsById({
      id: param.id,
    });

    return serviceResult;
  }

  async softDeleteById(params: IFarmHarvestSoftDeleteParams): Promise<void> {
    const { ip, param, user } = params;

    const serviceResult = await this.farmHarvestService.softDeleteById({
      id: param.id,
    });

    this.logger.log(
      `[softDeleteById] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );
  }

  async updateOneById(
    params: IFarmHarvestUpdateOneParams,
  ): Promise<IFarmHarvestUpdatePromise> {
    const { body, ip, param, user } = params;

    const serviceResult = await this.farmHarvestService.updateOneById({
      data: body,
      id: param.id,
    });

    this.logger.log(
      `[updateOneById] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );

    return serviceResult;
  }

  async createMany(
    params: IFarmHarvestCreateManyParams,
  ): Promise<IFarmHarvestCreatePromise[]> {
    const { user, body, ip } = params;
    const serviceResult = await this.farmHarvestService.createMany({
      data: body.data,
    });

    for (const result of serviceResult) {
      this.logger.log(
        `[createMany] - LOGINID:${user.loginId} | FARM_HARVEST_ID:${result.id} | IP:${ip}`,
        this.logContext,
      );
    }

    return serviceResult;
  }
}
