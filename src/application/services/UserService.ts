import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { TYPES } from '../../infrastructure/di/inversify.config';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getUserByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findByVerificationToken(token);
  }

  async verifyUserEmail(token: string): Promise<boolean> {
    return this.userRepository.verifyEmail(token);
  }
}