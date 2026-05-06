import { Prisma } from '../../../prisma/generated/client';

export interface IFarmHarvestCreateParams {
  owner_id: string;
  property_id: string;
  crop: number;
  metadata?: Prisma.InputJsonValue | null;
  created_at: Date;
}

export interface IFarmHarvestCreatePromise {
  id: string;
  crop: number;
}

export interface IFarmHarvestUpdateParams {
  id: string;
  owner_id: string;
  property_id: string;
  crop: number;
  metadata?: Prisma.InputJsonValue | null;
}

export interface IFarmHarvestUpdatePromise {
  id: string;
  owner_id: string;
  property_id: string;
}

export interface IFarmHarvestSoftDeleteParams {
  id: string;
}

export interface IFarmHarvestSoftDeletePromise {
  id: string;
  owner_id: string;
  property_id: string;
}

export interface IFarmHarvestGetOneParams {
  id: string;
}

export interface IFarmHarvestGetOnePromise {
  id: string;
  crop: number;
  metadata: Prisma.JsonValue | null;
  created_at: Date;
  updated_at: Date;
  owner: {
    id: string;
    fullname: string;
  };
  property: {
    id: string;
    alias: string;
    area_total: number;
    area_arable: number;
    area_vegetation: number;
    area_type: string;
    city: string;
    state: string;
    country: string;
    metadata: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  };
  crops: Array<{
    id: string;
    alias: string;
    area_arable: number;
    metadata: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  }>;
}

export interface IFarmHarvestGetRelationsParams {
  id: string;
}

export interface IFarmHarvestGetRelationsPromise {
  crops: number;
}
