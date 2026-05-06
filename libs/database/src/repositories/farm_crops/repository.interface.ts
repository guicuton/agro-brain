import { Prisma } from '../../../prisma/generated/client';

export interface IFarmCropsCreateParams {
  owner_id: string;
  property_id: string;
  harvest_id: string;
  alias: string;
  area_arable: number;
  metadata?: Prisma.InputJsonValue | null;
  created_at: Date;
}

export interface IFarmCropsCreatePromise {
  id: string;
  alias: string;
}

export interface IFarmCropsUpdateParams {
  id: string;
  owner_id: string;
  property_id: string;
  harvest_id: string;
  alias: string;
  area_arable: number;
  metadata?: Prisma.InputJsonValue | null;
}

export interface IFarmCropsUpdatePromise {
  id: string;
  owner_id: string;
  property_id: string;
  harvest_id: string;
}

export interface IFarmCropsSoftDeleteParams {
  id: string;
}

export interface IFarmCropsSoftDeletePromise {
  id: string;
  owner_id: string;
  property_id: string;
  harvest_id: string;
}

export interface IFarmCropsGetOneParams {
  id: string;
}

export interface IFarmCropsGetOnePromise {
  id: string;
  alias: string;
  area_arable: number;
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
  harvest: {
    id: string;
    crop: number;
    metadata: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  };
}
