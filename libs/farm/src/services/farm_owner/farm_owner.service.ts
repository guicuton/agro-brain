import { CacheModuleServices } from '@app/cache';
import { FarmOwnerRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import {
  IFarmOwnerCreateParams,
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOneParams,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsParams,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerSearchParams,
  IFarmOwnerSearchPromise,
  IFarmOwnerSoftDeleteParams,
  IFarmOwnerSoftDeletePromise,
  IFarmOwnerUpdateParams,
  IFarmOwnerUpdatePromise,
} from './farm_owner.interface';

@Injectable()
export class FarmOwnerService {
  private readonly cacheItem = 'farmOwner';
  private readonly cacheItemRelations = 'farmOwnerRelations';

  constructor(
    private readonly cache: CacheModuleServices,
    private readonly farmOwnerRepository: FarmOwnerRepository,
  ) {}

  async clearCache(id: string): Promise<void> {
    await this.cache.deleteCollection(`${id}:*`);
  }

  async getRelationsById(
    params: IFarmOwnerGetRelationsParams,
  ): Promise<IFarmOwnerGetRelationsPromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmOwnerGetRelationsPromise>({
      key: id,
      item: this.cacheItemRelations,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmOwnerRepository.getRelationsById({
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

  async getOneById(
    params: IFarmOwnerGetOneParams,
  ): Promise<IFarmOwnerGetOnePromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmOwnerGetOnePromise>({
      key: id,
      item: this.cacheItem,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmOwnerRepository.getOneById({
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
    params: IFarmOwnerSoftDeleteParams,
  ): Promise<IFarmOwnerSoftDeletePromise> {
    const { id } = params;
    const repositoryResult = await this.farmOwnerRepository.softDeleteById({
      id,
    });

    if (repositoryResult) {
      await this.clearCache(repositoryResult.id);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async updateOneById(
    params: IFarmOwnerUpdateParams,
  ): Promise<IFarmOwnerUpdatePromise> {
    const { data, id } = params;
    const repositoryResult = await this.farmOwnerRepository.updateOneById({
      ...data,
      id,
    });

    if (repositoryResult) {
      await this.clearCache(repositoryResult.id);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async createMany(
    params: IFarmOwnerCreateParams,
  ): Promise<IFarmOwnerCreatePromise[]> {
    const { data } = params;

    const repositoryResult = await this.farmOwnerRepository.createMany(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
      })),
    );

    return repositoryResult;
  }

  async search(
    params: IFarmOwnerSearchParams,
  ): Promise<IFarmOwnerSearchPromise[]> {
    return await this.farmOwnerRepository.search(params);
  }
}
