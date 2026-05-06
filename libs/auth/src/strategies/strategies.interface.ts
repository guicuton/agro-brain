export interface IAuthenticatedUser {
  username: string;
  loginId: string;
}

export interface IJwtGuardPayload {
  username: string;
  sub: string;
  iat?: number;
  exp?: number;
}
