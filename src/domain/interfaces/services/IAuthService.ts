import { User } from '../../entities/User';

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  generateTokens(payload: { userId: number; email: string }): { accessToken: string; refreshToken: string };
  verifyAccessToken(token: string): { userId: number; email: string };
  verifyRefreshToken(token: string): { userId: number; email: string };
  generateVerificationToken(): string;
}