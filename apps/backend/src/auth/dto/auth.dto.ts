export class RegisterDto {
  email: string;
  password: string;
  name: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
  access_token: string;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IUserProfile {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICurrentUser {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date;
  roles?: string[];
}
