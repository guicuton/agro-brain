import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database.service';
import {
  IFarmOwnerCreateParams,
  IFarmOwnerCreatePromise,
  IFarmOwnerGetOneParams,
  IFarmOwnerGetOnePromise,
  IFarmOwnerGetRelationsParams,
  IFarmOwnerGetRelationsPromise,
  IFarmOwnerSoftDeleteParams,
  IFarmOwnerSoftDeletePromise,
  IFarmOwnerUpdateParams,
  IFarmOwnerUpdatePromise,
} from './repository.interface';

@Injectable()
export class FarmOwnerRepository {
  constructor(private readonly repository: DatabaseService) {}

  async getOneById(
    params: IFarmOwnerGetOneParams,
  ): Promise<IFarmOwnerGetOnePromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_owner
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          id: true,
          fullname: true,
          doc: true,
          city: true,
          state: true,
          country: true,
          created_at: true,
          updated_at: true,
          properties: {
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
    params: IFarmOwnerGetRelationsParams,
  ): Promise<IFarmOwnerGetRelationsPromise | void> {
    const { id } = params;
    const promise = await this.repository.farm_owner
      .findFirst({
        where: {
          id,
          deleted: false,
        },
        select: {
          _count: {
            select: {
              properties: { where: { deleted: false } },
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
    params: IFarmOwnerSoftDeleteParams,
  ): Promise<IFarmOwnerSoftDeletePromise | void> {
    const promise = await this.repository.farm_owner
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
    params: Partial<IFarmOwnerUpdateParams>,
  ): Promise<IFarmOwnerUpdatePromise | void> {
    const { id, ...data } = params;
    const promise = await this.repository.farm_owner
      .update({
        data,
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
    params: IFarmOwnerCreateParams[],
  ): Promise<IFarmOwnerCreatePromise[]> {
    return this.repository.$transaction(async (tx) => {
      const created: IFarmOwnerCreatePromise[] = [];
      for (const item of params) {
        const row = await tx.farm_owner
          .upsert({
            create: item,
            update: {
              ...item,
              deleted: false,
            },
            where: {
              doc: item.doc,
            },
            select: { id: true, fullname: true },
          })
          .catch((err) => this.repository.errorHandler(err));

        if (row) created.push(row);
      }
      return created;
    });
  }
}
