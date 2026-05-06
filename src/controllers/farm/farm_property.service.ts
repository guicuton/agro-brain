import {
  FarmPropertyService,
  IFarmPropertyCreatePromise,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertyUpdatePromise,
} from '@app/farm';
import { LoggerService } from '@app/logger';
import { Injectable } from '@nestjs/common';
import {
  IFarmPropertyCreateManyParams,
  IFarmPropertyGetOneParams,
  IFarmPropertyGetRelationsParams,
  IFarmPropertySoftDeleteParams,
  IFarmPropertyUpdateOneParams,
} from './farm.interface';

@Injectable()
export class FarmPropertyControllerService {
  private readonly logContext = FarmPropertyControllerService.name;

  constructor(
    private readonly logger: LoggerService,
    private readonly farmPropertyService: FarmPropertyService,
  ) {}

  async getOneById(
    params: IFarmPropertyGetOneParams,
  ): Promise<IFarmPropertyGetOnePromise> {
    const { param } = params;

    const serviceResult = await this.farmPropertyService.getOneById({
      id: param.id,
    });

    return serviceResult;
  }

  async getRelationsById(
    params: IFarmPropertyGetRelationsParams,
  ): Promise<IFarmPropertyGetRelationsPromise> {
    const { param } = params;

    const serviceResult = await this.farmPropertyService.getRelationsById({
      id: param.id,
    });

    return serviceResult;
  }

  async softDeleteById(params: IFarmPropertySoftDeleteParams): Promise<void> {
    const { ip, param, user } = params;

    const serviceResult = await this.farmPropertyService.softDeleteById({
      id: param.id,
    });

    this.logger.log(
      `[softDeleteById] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );
  }

  async updateOneById(
    params: IFarmPropertyUpdateOneParams,
  ): Promise<IFarmPropertyUpdatePromise> {
    const { body, ip, param, user } = params;

    const serviceResult = await this.farmPropertyService.updateOneById({
      data: body,
      id: param.id,
    });

    this.logger.log(
      `[updateOneById] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${serviceResult.id} | IP:${ip}`,
      this.logContext,
    );

    return serviceResult;
  }

  async createMany(
    params: IFarmPropertyCreateManyParams,
  ): Promise<IFarmPropertyCreatePromise[]> {
    const { user, body, ip } = params;
    const serviceResult = await this.farmPropertyService.createMany({
      data: body.data,
    });

    for (const result of serviceResult) {
      this.logger.log(
        `[createMany] - LOGINID:${user.loginId} | FARM_PROPERTY_ID:${result.id} | IP:${ip}`,
        this.logContext,
      );
    }

    return serviceResult;
  }
}
