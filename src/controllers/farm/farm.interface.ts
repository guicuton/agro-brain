import { IAuthenticatedUser } from '@app/auth';
import {
  IFarmCropsBulkCreateDTO,
  IFarmCropsUpdateDTO,
  IFarmHarvestBulkCreateDTO,
  IFarmHarvestUpdateDTO,
  IFarmIdDto,
  IFarmOwnerBulkCreateDTO,
  IFarmOwnerSearchDTO,
  IFarmOwnerUpdateDTO,
  IFarmPropertyBulkCreateDTO,
  IFarmPropertyUpdateDTO,
} from './farm.dto';

export interface IFarmOwnerCreateManyParams {
  user: IAuthenticatedUser;
  body: IFarmOwnerBulkCreateDTO;
  ip: string;
}

export interface IFarmOwnerUpdateOneParams {
  user: IAuthenticatedUser;
  body: IFarmOwnerUpdateDTO;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmOwnerSoftDeleteParams {
  user: IAuthenticatedUser;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmOwnerGetOneParams {
  param: IFarmIdDto;
}

export interface IFarmOwnerGetRelationsParams {
  param: IFarmIdDto;
}

export interface IFarmOwnerSearchParams {
  query: IFarmOwnerSearchDTO;
}

export interface IFarmPropertyCreateManyParams {
  user: IAuthenticatedUser;
  body: IFarmPropertyBulkCreateDTO;
  ip: string;
}

export interface IFarmPropertyUpdateOneParams {
  user: IAuthenticatedUser;
  body: IFarmPropertyUpdateDTO;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmPropertySoftDeleteParams {
  user: IAuthenticatedUser;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmPropertyGetOneParams {
  param: IFarmIdDto;
}

export interface IFarmPropertyGetRelationsParams {
  param: IFarmIdDto;
}

export interface IFarmPropertySearchParams {
  query: IFarmOwnerSearchDTO;
}

export interface IFarmHarvestCreateManyParams {
  user: IAuthenticatedUser;
  body: IFarmHarvestBulkCreateDTO;
  ip: string;
}

export interface IFarmHarvestUpdateOneParams {
  user: IAuthenticatedUser;
  body: IFarmHarvestUpdateDTO;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmHarvestSoftDeleteParams {
  user: IAuthenticatedUser;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmHarvestGetOneParams {
  param: IFarmIdDto;
}

export interface IFarmHarvestGetRelationsParams {
  param: IFarmIdDto;
}

export interface IFarmCropsCreateManyParams {
  user: IAuthenticatedUser;
  body: IFarmCropsBulkCreateDTO;
  ip: string;
}

export interface IFarmCropsUpdateOneParams {
  user: IAuthenticatedUser;
  body: IFarmCropsUpdateDTO;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmCropsSoftDeleteParams {
  user: IAuthenticatedUser;
  param: IFarmIdDto;
  ip: string;
}

export interface IFarmCropsGetOneParams {
  param: IFarmIdDto;
}
