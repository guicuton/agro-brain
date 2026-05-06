export interface IUserValidateLoginParams {
  username: string;
}

export interface IUserValidateLoginPromise {
  id: string;
  password: string;
}

export interface IUserValidatePasswordParams {
  userPassword: string;
  hashPassword: string;
}

export interface IUserUpdatePasswordParams {
  loginId: string;
  currentPassword: string;
  newPassword: string;
}

export interface IUserCreateParams {
  username: string;
  password: string;
  email: string;
}

export interface IUserCreatePromise {
  id: string;
}
