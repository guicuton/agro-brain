import { Prisma } from '../../../../database/prisma/generated/client';
import {
  IFarmCropsDTO,
  IFarmCropsUpdateDTO,
} from '../../../../../src/controllers/farm/farm.dto';

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

export interface IFarmCropsSoftDeleteParams {
  id: string;
}

export interface IFarmCropsSoftDeletePromise {
  id: string;
}

export interface IFarmCropsUpdateParams {
  id: string;
  data: IFarmCropsUpdateDTO;
}

export interface IFarmCropsUpdatePromise {
  id: string;
}

export interface IFarmCropsCreateParams {
  data: IFarmCropsDTO[];
}

export interface IFarmCropsCreatePromise {
  id: string;
  alias: string;
}
