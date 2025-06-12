export interface SignupDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayloadDto {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  tokens: AuthTokensDto;
}

export interface JWTPayloadDto {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}