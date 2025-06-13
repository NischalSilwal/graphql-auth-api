import { User } from '../../entities/User';
                  
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findByVerificationToken(token: string): Promise<User | null>;
  create(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verificationToken: string;
  }): Promise<User>;
  updateRefreshToken(userId: number, refreshToken: string): Promise<void>;
  verifyEmail(verificationToken: string): Promise<boolean>;
  removeRefreshToken(userId: number): Promise<void>;
}