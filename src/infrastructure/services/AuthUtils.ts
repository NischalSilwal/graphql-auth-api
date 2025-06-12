// src/infrastructure/services/AuthUtils.ts
import { injectable } from 'inversify';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config/config';
import { IAuthService } from '../../domain/interfaces/services/IAuthService';

@injectable()
export class AuthUtils implements IAuthService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateTokens(payload: { userId: number; email: string }): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(payload, config.jwt.accessSecret as Secret, {
      algorithm: 'HS256',
      expiresIn: config.jwt.accessExpiry,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret as Secret, {
      algorithm: 'HS256',
      expiresIn: config.jwt.refreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { userId: number; email: string } {
    return jwt.verify(token, config.jwt.accessSecret) as { userId: number; email: string };
  }

  verifyRefreshToken(token: string): { userId: number; email: string } {
    return jwt.verify(token, config.jwt.refreshSecret) as { userId: number; email: string };
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
