import { CacheModuleServices } from '@app/cache';
import {
  FarmPropertyRepository,
  IFarmPropertySearchParams,
  IFarmPropertySearchPromise,
} from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_TTL } from '../../../../../utils/constants';
import {
  IFarmPropertyCreateParams,
  IFarmPropertyCreatePromise,
  IFarmPropertyGetOneParams,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsParams,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertySoftDeleteParams,
  IFarmPropertySoftDeletePromise,
  IFarmPropertyUpdateParams,
  IFarmPropertyUpdatePromise,
} from './farm_property.interface';

@Injectable()
export class FarmPropertyService {
  private readonly cacheItem = 'farmProperty';
  private readonly cacheItemRelations = 'farmPropertyRelations';

  constructor(
    private readonly cache: CacheModuleServices,
    private readonly farmPropertyRepository: FarmPropertyRepository,
  ) {}

  async clearCache(id: string): Promise<void> {
    await this.cache.deleteCollection(`${id}:*`);
  }

  async getOneById(
    params: IFarmPropertyGetOneParams,
  ): Promise<IFarmPropertyGetOnePromise> {
    const { id } = params;

    const cached = await this.cache.get<IFarmPropertyGetOnePromise>({
      key: id,
      item: this.cacheItem,
    });

    if (cached) return cached;

    const repositoryResult = await this.farmPropertyRepository.getOneById({
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
    params: IFarmPropertyGetRelationsParams,
  ): Promise<IFarmPropertyGetRelationsPromise> {
    const { id } = params;

    const cache = await this.cache.get<IFarmPropertyGetRelationsPromise>({
      key: id,
      item: this.cacheItemRelations,
    });

    if (cache) return cache;

    const repositoryResult = await this.farmPropertyRepository.getRelationsById(
      {
        id,
      },
    );

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
    params: IFarmPropertySoftDeleteParams,
  ): Promise<IFarmPropertySoftDeletePromise> {
    const { id } = params;
    const repositoryResult = await this.farmPropertyRepository.softDeleteById({
      id,
    });

    if (repositoryResult) {
      await this.clearCache(repositoryResult.id);
      return repositoryResult;
    }

    throw new NotFoundException();
  }

  async updateOneById(
    params: IFarmPropertyUpdateParams,
  ): Promise<IFarmPropertyUpdatePromise> {
    const { data, id } = params;
    const repositoryResult = await this.farmPropertyRepository.updateOneById({
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
    params: IFarmPropertyCreateParams,
  ): Promise<IFarmPropertyCreatePromise[]> {
    const { data } = params;

    const repositoryResult = await this.farmPropertyRepository.createMany(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
      })),
    );

    const ownerIds = new Set(data.map((item) => item.owner_id));
    await Promise.all([
      ...Array.from(ownerIds).map((id) => this.clearCache(id)),
    ]);

    return repositoryResult;
  }

  async search(
    params: IFarmPropertySearchParams,
  ): Promise<IFarmPropertySearchPromise[]> {
    return await this.farmPropertyRepository.findManyDynamic(params);
  }
}
