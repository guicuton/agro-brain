import {
  IFarmOwnerDTO,
  IFarmOwnerUpdateDTO,
} from '../../../../../src/controllers/farm/farm.dto';
import { Prisma } from '../../../../database/prisma/generated/client';

export interface IFarmOwnerGetOneParams {
  id: string;
}

export interface IFarmOwnerGetOnePromise {
  id: string;
  fullname: string;
  doc: string;
  city: string;
  state: string;
  country: string;
  created_at: Date;
  updated_at: Date;
  properties: Array<{
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
    harvests: Array<{
      id: string;
      crop: number;
      metadata: Prisma.JsonValue | null;
      created_at: Date;
      updated_at: Date;
      crops: Array<{
        id: string;
        alias: string;
        area_arable: number;
        metadata: Prisma.JsonValue | null;
        created_at: Date;
        updated_at: Date;
      }>;
    }>;
  }>;
}

export interface IFarmOwnerGetRelationsParams {
  id: string;
}

export interface IFarmOwnerGetRelationsPromise {
  properties: number;
  harvests: number;
  crops: number;
}

export interface IFarmOwnerSoftDeleteParams {
  id: string;
}

export interface IFarmOwnerSoftDeletePromise {
  id: string;
}

export interface IFarmOwnerUpdateParams {
  id: string;
  data: IFarmOwnerUpdateDTO;
}

export interface IFarmOwnerUpdatePromise {
  id: string;
}

export interface IFarmOwnerCreateParams {
  data: IFarmOwnerDTO[];
}

export interface IFarmOwnerCreatePromise {
  id: string;
  fullname: string;
}
