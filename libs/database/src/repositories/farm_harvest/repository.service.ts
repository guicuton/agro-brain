import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client';
import { DatabaseService } from '../../database.service';
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
} from './repository.interface';

const normalizeMetadata = (
  metadata: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined => {
  if (metadata === null) return Prisma.DbNull;
  return metadata;
};

@Injectable()
export class FarmHarvestRepository {
  constructor(private readonly repository: DatabaseService) {}

  async getOneById(
    params: IFarmHarvestGetOneParams,
  ): Promise<IFarmHarvestGetOnePromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_harvest
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          id: true,
          crop: true,
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
          crops: {
            select: {
              id: true,
              alias: true,
              area_arable: true,
              metadata: true,
              created_at: true,
              updated_at: true,
            },
            where: {
              deleted: false,
            },
          },
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async getRelationsById(
    params: IFarmHarvestGetRelationsParams,
  ): Promise<IFarmHarvestGetRelationsPromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_harvest
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          _count: {
            select: {
              crops: { where: { deleted: false } },
            },
          },
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise._count;
  }

  async softDeleteById(
    params: IFarmHarvestSoftDeleteParams,
  ): Promise<IFarmHarvestSoftDeletePromise | void> {
    const promise = await this.repository.farm_harvest
      .update({
        data: {
          deleted: true,
        },
        where: params,
        select: {
          id: true,
          owner_id: true,
          property_id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async updateOneById(
    params: Partial<IFarmHarvestUpdateParams>,
  ): Promise<IFarmHarvestUpdatePromise | void> {
    const { id, metadata, ...data } = params;
    const promise = await this.repository.farm_harvest
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
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async createMany(
    params: IFarmHarvestCreateParams[],
  ): Promise<IFarmHarvestCreatePromise[]> {
    return this.repository.$transaction(async (tx) => {
      const created: IFarmHarvestCreatePromise[] = [];
      for (const item of params) {
        const { metadata, ...rest } = item;
        const normalizedMetadata = normalizeMetadata(metadata);
        const row = await tx.farm_harvest
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
              property_id_crop: {
                property_id: item.property_id,
                crop: item.crop,
              },
            },
            select: { id: true, crop: true },
          })
          .catch((err) => this.repository.errorHandler(err));

        if (row) created.push(row);
      }
      return created;
    });
  }
}
