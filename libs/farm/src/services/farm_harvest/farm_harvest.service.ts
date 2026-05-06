import { CacheModuleServices } from '@app/cache';
import { FarmHarvestRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import {
  IFarmHarvestCreateParams,
  IFarmHarvestCreatePromise,
  IFarmHarvestGetOneParams,
  IFarmHarvestGetOnePromise,
  IFarmHarvestGetRelationsParams,
  IFarmHarvestGetRelationsPromise,
  IFarmHarvestSoftDeleteParams,
  IFarmHarvestSoftDeletePromise,
  IFarmHarvestUpdateParams,
  IFarmHarvestUpdatePromise,
} from './farm_harvest.interface';

@Injectable()
export class FarmHarvestService {
  private readonly cacheItem = 'farmHarvest';
  private readonly cacheItemRelations = 'farmHarvestRelations';

  constructor(
    private readonly cache: CacheModuleServices,
    private readonly farmHarvestRepository: FarmHarvestRepository,
  ) {}

  async clearCache(id: string): Promise<void> {
    await this.cache.deleteCollection(`${id}:*`);
  }

  async getOneById(
    params: IFarmHarvestGetOneParams,
  ): Promise<IFarmHarvestGetOnePromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmHarvestGetOnePromise>({
      key: id,
      item: this.cacheItem,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmHarvestRepository.getOneById({
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

  async getRelationsById(
    params: IFarmHarvestGetRelationsParams,
  ): Promise<IFarmHarvestGetRelationsPromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmHarvestGetRelationsPromise>({
      key: id,
      item: this.cacheItemRelations,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmHarvestRepository.getRelationsById({
      id,
    });

    if (repositoryResult) {
      await this.cache.set({
        key: id,
        item: this.cacheItemRelations,
        data: repositoryResult,
        ttl: DEFAULT_TTL.five,
      });

      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async softDeleteById(
    params: IFarmHarvestSoftDeleteParams,
  ): Promise<IFarmHarvestSoftDeletePromise> {
    const { id } = params;
    const repositoryResult = await this.farmHarvestRepository.softDeleteById({
      id,
    });

    if (repositoryResult) {
      await Promise.all([
        this.clearCache(repositoryResult.id),
        this.clearCache(repositoryResult.property_id),
        this.clearCache(repositoryResult.owner_id),
      ]);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async updateOneById(
    params: IFarmHarvestUpdateParams,
  ): Promise<IFarmHarvestUpdatePromise> {
    const { data, id } = params;
    const repositoryResult = await this.farmHarvestRepository.updateOneById({
      ...data,
      id,
    });

    if (repositoryResult) {
      await Promise.all([
        this.clearCache(repositoryResult.id),
        this.clearCache(repositoryResult.property_id),
        this.clearCache(repositoryResult.owner_id),
      ]);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async createMany(
    params: IFarmHarvestCreateParams,
  ): Promise<IFarmHarvestCreatePromise[]> {
    const { data } = params;

    const repositoryResult = await this.farmHarvestRepository.createMany(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
      })),
    );

    const ownerIds = new Set(data.map((item) => item.owner_id));
    const propertyIds = new Set(data.map((item) => item.property_id));
    await Promise.all([
      ...Array.from(ownerIds).map((id) => this.clearCache(id)),
      ...Array.from(propertyIds).map((id) => this.clearCache(id)),
    ]);

    return repositoryResult;
  }
}
