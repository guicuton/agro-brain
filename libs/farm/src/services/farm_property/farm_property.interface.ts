import {
  IFarmPropertyDTO,
  IFarmPropertyUpdateDTO,
} from '../../../../../src/controllers/farm/farm.dto';
import { Prisma } from '../../../../database/prisma/generated/client';

export interface IFarmPropertyGetOneParams {
  id: string;
}

export interface IFarmPropertyGetOnePromise {
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
  owner: {
    id: string;
    fullname: string;
  };
  harvests: Array<{
    id: string;
    crop: number;
    metadata: Prisma.JsonValue | null;
    crops: Array<{
      id: string;
      alias: string;
      area_arable: number;
      metadata: Prisma.JsonValue | null;
    }>;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface IFarmPropertyGetRelationsParams {
  id: string;
}

export interface IFarmPropertyGetRelationsPromise {
  harvests: number;
  crops: number;
}

export interface IFarmPropertySoftDeleteParams {
  id: string;
}

export interface IFarmPropertySoftDeletePromise {
  id: string;
}

export interface IFarmPropertyUpdateParams {
  id: string;
  data: IFarmPropertyUpdateDTO;
}

export interface IFarmPropertyUpdatePromise {
  id: string;
}

export interface IFarmPropertyCreateParams {
  data: IFarmPropertyDTO[];
}

export interface IFarmPropertyCreatePromise {
  id: string;
  alias: string;
}

export interface IFarmPropertySearchParams {
  alias?: string;
  owner_id?: string;
  area_total?: number;
  area_arable?: number;
  area_vegetation?: number;
  city?: string;
  state?: string;
}

export interface IFarmPropertySearchPromise {
  id: string;
  owner: {
    id: string;
    fullname: string;
  };
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
}
