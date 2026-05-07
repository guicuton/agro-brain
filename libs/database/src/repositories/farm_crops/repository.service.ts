import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client';
import { DatabaseService } from '../../database.service';
import {
  IFarmCropsCreateParams,
  IFarmCropsCreatePromise,
  IFarmCropsGetOneParams,
  IFarmCropsGetOnePromise,
  IFarmCropsSoftDeleteParams,
  IFarmCropsSoftDeletePromise,
  IFarmCropsStatsPromise,
  IFarmCropsUpdateParams,
  IFarmCropsUpdatePromise,
} from './repository.interface';

const normalizeMetadata = (
  metadata: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined => {
  if (metadata === null) return Prisma.DbNull;
  return metadata;
};

@Injectable()
export class FarmCropsRepository {
  constructor(private readonly repository: DatabaseService) {}

  async getOneById(
    params: IFarmCropsGetOneParams,
  ): Promise<IFarmCropsGetOnePromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_crops
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          id: true,
          alias: true,
          area_arable: true,
          metadata: true,
          created_at: true,
          updated_at: true,
          owner: {
            select: {
              id: true,
              fullname: true,
            },
          },
          property: {
            select: {
              id: true,
              alias: true,
              area_total: true,
              area_arable: true,
              area_vegetation: true,
              area_type: true,
              city: true,
              state: true,
              country: true,
              metadata: true,
              created_at: true,
              updated_at: true,
            },
          },
          harvest: {
            select: {
              id: true,
              crop: true,
              metadata: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async softDeleteById(
    params: IFarmCropsSoftDeleteParams,
  ): Promise<IFarmCropsSoftDeletePromise | void> {
    const promise = await this.repository.farm_crops
      .update({
        data: {
          deleted: true,
        },
        where: params,
        select: {
          id: true,
          owner_id: true,
          property_id: true,
          harvest_id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async updateOneById(
    params: Partial<IFarmCropsUpdateParams>,
  ): Promise<IFarmCropsUpdatePromise | void> {
    const { id, metadata, ...data } = params;
    const promise = await this.repository.farm_crops
      .update({
        data: {
          ...data,
          metadata: normalizeMetadata(metadata),
        },
        where: {
          id,
          deleted: false,
        },
        select: {
          id: true,
          owner_id: true,
          property_id: true,
          harvest_id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async getStats(): Promise<IFarmCropsStatsPromise> {
    const grouped = await this.repository.farm_crops
      .groupBy({
        by: ['alias'],
        where: { deleted: false },
        _count: { _all: true },
        _sum: { area_arable: true },
      })
      .catch((err) => this.repository.errorHandler(err));

    const rows = grouped ?? [];

    let total_crops = 0;
    let total_area_arable = 0;
    const crops: { alias: string; area_arable: number }[] = [];

    for (const row of rows) {
      const count = row._count?._all ?? 0;
      const area = row._sum?.area_arable ?? 0;

      total_crops += count;
      total_area_arable += area;
      crops.push({ alias: row.alias, area_arable: area });
    }

    return { total_crops, total_area_arable, crops };
  }

  async createMany(
    params: IFarmCropsCreateParams[],
  ): Promise<IFarmCropsCreatePromise[]> {
    return this.repository.$transaction(async (tx) => {
      const created: IFarmCropsCreatePromise[] = [];
      for (const item of params) {
        const { metadata, ...rest } = item;
        const normalizedMetadata = normalizeMetadata(metadata);
        const row = await tx.farm_crops
          .upsert({
            create: {
              ...rest,
              metadata: normalizedMetadata,
            },
            update: {
              ...rest,
              metadata: normalizedMetadata,
              deleted: false,
            },
            where: {
              harvest_id_alias: {
                harvest_id: item.harvest_id,
                alias: item.alias,
              },
            },
            select: { id: true, alias: true },
          })
          .catch((err) => this.repository.errorHandler(err));

        if (row) created.push(row);
      }
      return created;
    });
  }
}
