import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../prisma/generated/client';
import { DatabaseService } from '../../database.service';
import {
  IFarmPropertyCreateParams,
  IFarmPropertyCreatePromise,
  IFarmPropertyGetAreaArableParams,
  IFarmPropertyGetAreaArablePromise,
  IFarmPropertyGetOneParams,
  IFarmPropertyGetOnePromise,
  IFarmPropertyGetRelationsParams,
  IFarmPropertyGetRelationsPromise,
  IFarmPropertySoftDeleteParams,
  IFarmPropertySoftDeletePromise,
  IFarmPropertyUpdateParams,
  IFarmPropertyUpdatePromise,
} from './repository.interface';

const normalizeMetadata = (
  metadata: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined => {
  if (metadata === null) return Prisma.DbNull;
  return metadata;
};

@Injectable()
export class FarmPropertyRepository {
  constructor(private readonly repository: DatabaseService) {}

  async getAreasById(
    params: IFarmPropertyGetAreaArableParams,
  ): Promise<IFarmPropertyGetAreaArablePromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_property
      .findFirst({
        select: {
          area_total: true,
          area_arable: true,
          area_vegetation: true,
          area_type: true,
          crops: {
            select: {
              area_arable: true,
            },
            where: {
              deleted: false,
            },
          },
        },
        where: {
          id,
          deleted: false,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async getOneById(
    params: IFarmPropertyGetOneParams,
  ): Promise<IFarmPropertyGetOnePromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_property
      .findFirst({
        where: {
          id,
          deleted: false,
        },
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
          owner: {
            select: {
              id: true,
              fullname: true,
            },
          },
          harvests: {
            select: {
              id: true,
              crop: true,
              metadata: true,
              created_at: true,
              updated_at: true,
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
    params: IFarmPropertyGetRelationsParams,
  ): Promise<IFarmPropertyGetRelationsPromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_property
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          _count: {
            select: {
              harvests: { where: { deleted: false } },
              crops: { where: { deleted: false } },
            },
          },
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise._count;
  }

  async softDeleteById(
    params: IFarmPropertySoftDeleteParams,
  ): Promise<IFarmPropertySoftDeletePromise | void> {
    const promise = await this.repository.farm_property
      .update({
        data: {
          deleted: true,
        },
        where: params,
        select: {
          id: true,
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async updateOneById(
    params: Partial<IFarmPropertyUpdateParams>,
  ): Promise<IFarmPropertyUpdatePromise | void> {
    const { id, metadata, ...data } = params;
    const promise = await this.repository.farm_property
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
        },
      })
      .catch((err) => this.repository.errorHandler(err));

    if (promise) return promise;
  }

  async createMany(
    params: IFarmPropertyCreateParams[],
  ): Promise<IFarmPropertyCreatePromise[]> {
    return this.repository.$transaction(async (tx) => {
      const created: IFarmPropertyCreatePromise[] = [];
      for (const item of params) {
        const { metadata, ...rest } = item;
        const normalizedMetadata = normalizeMetadata(metadata);
        const row = await tx.farm_property
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
              owner_id_alias: {
                owner_id: item.owner_id,
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
