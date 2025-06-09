import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/config';
import { JWTPayload, AuthTokens } from '../types';

// Ensure config types are correctly defined
interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiry: string | number;
  refreshExpiry: string | number;
}

const jwtConfig: JwtConfig = config.jwt;

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTokens(payload: JWTPayload): AuthTokens {
    const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiry,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, jwtConfig.accessSecret) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, jwtConfig.refreshSecret) as JWTPayload;
  }

  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}