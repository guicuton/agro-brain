import { CacheModuleServices } from '@app/cache';
import { FarmCropsRepository, FarmPropertyRepository } from '@app/database';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import {
  IFarmCropsCreateParams,
  IFarmCropsCreatePromise,
  IFarmCropsGetOneParams,
  IFarmCropsGetOnePromise,
  IFarmCropsSoftDeleteParams,
  IFarmCropsSoftDeletePromise,
  IFarmCropsUpdateParams,
  IFarmCropsUpdatePromise,
} from './farm_crops.interface';
import { IFarmCropsDTO } from '../../../../../src/controllers/farm/farm.dto';

@Injectable()
export class FarmCropsService {
  private readonly cacheItem = 'farmCrops';

  constructor(
    private readonly cache: CacheModuleServices,
    private readonly farmCropsRepository: FarmCropsRepository,
    private readonly farmPropertyRepository: FarmPropertyRepository,
  ) {}

  async clearCache(id: string): Promise<void> {
    await this.cache.deleteCollection(`${id}:*`);
  }

  async getOneById(
    params: IFarmCropsGetOneParams,
  ): Promise<IFarmCropsGetOnePromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmCropsGetOnePromise>({
      key: id,
      item: this.cacheItem,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmCropsRepository.getOneById({
      id,
    });

    if (repositoryResult) {
      await this.cache.set({
        key: id,
        item: this.cacheItem,
        data: repositoryResult,
        ttl: DEFAULT_TTL.five,
      });

      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async softDeleteById(
    params: IFarmCropsSoftDeleteParams,
  ): Promise<IFarmCropsSoftDeletePromise> {
    const { id } = params;
    const repositoryResult = await this.farmCropsRepository.softDeleteById({
      id,
    });

    if (repositoryResult) {
      await Promise.all([
        this.clearCache(repositoryResult.id),
        this.clearCache(repositoryResult.harvest_id),
        this.clearCache(repositoryResult.property_id),
        this.clearCache(repositoryResult.owner_id),
      ]);
      return { id: repositoryResult.id };
    }

    throw new NotFoundException();
  }

  async updateOneById(
    params: IFarmCropsUpdateParams,
  ): Promise<IFarmCropsUpdatePromise> {
    const { data, id } = params;
    const repositoryResult = await this.farmCropsRepository.updateOneById({
      ...data,
      id,
    });

    if (repositoryResult) {
      await Promise.all([
        this.clearCache(repositoryResult.id),
        this.clearCache(repositoryResult.harvest_id),
        this.clearCache(repositoryResult.property_id),
        this.clearCache(repositoryResult.owner_id),
      ]);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  private async areaArableValidation(data: IFarmCropsDTO[]): Promise<void> {
    const propertyIds = new Set(data.map((item) => item.property_id));

    for (const propertyId of propertyIds) {
      const propertyArea = await this.farmPropertyRepository.getAreasById({
        id: propertyId,
      });

      if (propertyArea) {
        const { area_arable, crops } = propertyArea;
        const currentCropsAreaArable = crops.reduce(
          (acc, cur) => acc + cur.area_arable,
          0,
        );

        const newCropItem = data.find(
          (item) => item.property_id === propertyId,
        );

        const newCropAreaArable = newCropItem?.area_arable ?? 0;
        const newTotalCropAreaArable =
          currentCropsAreaArable + newCropAreaArable;

        if (newTotalCropAreaArable > area_arable)
          throw new BadRequestException('area_arable_limit');
      }
    }
  }

  async createMany(
    params: IFarmCropsCreateParams,
  ): Promise<IFarmCropsCreatePromise[]> {
    const { data } = params;

    const harvestIds = new Set(data.map((item) => item.harvest_id));
    const propertyIds = new Set(data.map((item) => item.property_id));
    const ownerIds = new Set(data.map((item) => item.owner_id));

    await Promise.all([
      ...Array.from(harvestIds).map((id) => this.clearCache(id)),
      ...Array.from(propertyIds).map((id) => this.clearCache(id)),
      ...Array.from(ownerIds).map((id) => this.clearCache(id)),
    ]);

    await this.areaArableValidation(data);

    const repositoryResult = await this.farmCropsRepository.createMany(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
      })),
    );

    return repositoryResult;
  }
}
