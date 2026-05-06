import { Prisma } from '../../../../database/prisma/generated/client';
import {
  IFarmHarvestDTO,
  IFarmHarvestUpdateDTO,
} from '../../../../../src/controllers/farm/farm.dto';

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

export interface IFarmHarvestSoftDeleteParams {
  id: string;
}

export interface IFarmHarvestSoftDeletePromise {
  id: string;
}

export interface IFarmHarvestUpdateParams {
  id: string;
  data: IFarmHarvestUpdateDTO;
}

export interface IFarmHarvestUpdatePromise {
  id: string;
}

export interface IFarmHarvestCreateParams {
  data: IFarmHarvestDTO[];
}

export interface IFarmHarvestCreatePromise {
  id: string;
  crop: number;
}
