import { Prisma } from '../../../prisma/generated/client';
import { AREA_TYPE } from '../../../prisma/generated/enums';

export interface IFarmPropertyCreateParams {
  owner_id: string;
  alias: string;
  area_total: number;
  area_arable: number;
  area_vegetation: number;
  area_type: AREA_TYPE;
  city: string;
  state: string;
  country: string;
  metadata?: Prisma.InputJsonValue | null;
  created_at: Date;
}

export interface IFarmPropertyCreatePromise {
  id: string;
  alias: string;
}

export interface IFarmPropertyUpdateParams {
  id: string;
  owner_id: string;
  alias: string;
  area_total: number;
  area_arable: number;
  area_vegetation: number;
  area_type: AREA_TYPE;
  city: string;
  state: string;
  country: string;
  metadata?: Prisma.InputJsonValue | null;
}

export interface IFarmPropertyUpdatePromise {
  id: string;
}

export interface IFarmPropertySoftDeleteParams {
  id: string;
}

export interface IFarmPropertySoftDeletePromise {
  id: string;
}

export interface IFarmPropertyGetOneParams {
  id: string;
}

export interface IFarmPropertyGetRelationsParams {
  id: string;
}

export interface IFarmPropertyGetRelationsPromise {
  harvests: number;
  crops: number;
}

export interface IFarmPropertyGetAreaArableParams {
  id: string;
}

export interface IFarmPropertyGetAreaArablePromise {
  area_total: number;
  area_vegetation: number;
  area_arable: number;
  area_type: string;
  crops: Array<{
    area_arable: number;
  }>;
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
  created_at: Date;
  updated_at: Date;
  owner: {
    id: string;
    fullname: string;
  };
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

export interface IFarmPropertyStatsByState {
  state: string;
  value: number;
}

export interface IFarmPropertyStatsPromise {
  properties: {
    total: number;
    states: IFarmPropertyStatsByState[];
  };
  properties_areas: {
    total: number;
    states: IFarmPropertyStatsByState[];
  };
}
