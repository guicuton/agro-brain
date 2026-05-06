import { IAuthenticatedUser } from '@app/auth';
import { IAuthPutPasswordDTO } from './auth.dto';

export interface IAuthLoginParams {
  user: IAuthenticatedUser;
  ip: string;
}

export interface IAuthLoginPromise {
  access_token: string;
}

export interface IAuthLoginPasswordUpdateParams {
  user: IAuthenticatedUser;
  ip: string;
  body: IAuthPutPasswordDTO;
}
