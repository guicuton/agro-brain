export interface ILoginFindFirstParams {
  username?: string;
  email?: string;
}

export interface ILoginFindFirstPromise {
  id: string;
  password: string;
}

export interface ILoginUpdatePasswordParams {
  passwordHash: string;
  loginId: string;
}

export interface ILoginUpdatePasswordPromise {
  id: string;
}

export interface ILoginCreateOneParams {
  username: string;
  password: string;
  email: string;
  created_at: Date;
}

export interface ILoginCreateOnePromise {
  id: string;
}
