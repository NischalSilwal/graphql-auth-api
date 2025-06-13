// src/infrastructure/di/inversify.config.ts
import { Container } from 'inversify';
import 'reflect-metadata';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { IAuthService } from '../../domain/interfaces/services/IAuthService';
import { IEmailService } from '../../domain/interfaces/services/IEmailService';
import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from '../services/EmailService';
import { AuthService } from '../../application/services/AuthService';
import { AuthUtils } from '../services/AuthUtils';
import { TYPES } from './types';

const container = new Container();

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IAuthService>(TYPES.AuthUtils).to(AuthUtils).inSingletonScope();
container.bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();

export { container };