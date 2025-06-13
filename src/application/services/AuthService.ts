import { inject, injectable } from 'inversify';
import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { IUserRepository } from '../../domain/interfaces/repositories/IUserRepository';
import { IAuthService } from '../../domain/interfaces/services/IAuthService';
import { IEmailService } from '../../domain/interfaces/services/IEmailService';
import { AuthPayloadDto, AuthTokensDto, LoginDto, SignupDto } from '../dto/AuthDto';
import { TYPES } from '../../infrastructure/di/types';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.AuthUtils) private authUtils: IAuthService,
    @inject(TYPES.EmailService) private emailService: IEmailService
  ) {}

  async signup(input: SignupDto): Promise<string> {
    const { firstName, lastName, email, password } = input;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserInputError('User with this email already exists');
    }

    // Hash password and generate verification token
    const hashedPassword = await this.authUtils.hashPassword(password);
    const verificationToken = this.authUtils.generateVerificationToken();

    // Create user
    await this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(email, firstName, verificationToken);

    return 'User registered successfully! Please check your email to verify your account.';
  }

  async login(input: LoginDto): Promise<AuthPayloadDto> {
    const { email, password } = input;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isValidPassword = await this.authUtils.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ForbiddenError('Please verify your email before logging in');
    }

    // Generate tokens
    const tokens = this.authUtils.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Update refresh token in database
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokensDto> {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    try {
      // Verify refresh token
      const payload = this.authUtils.verifyRefreshToken(refreshToken);
      
      // Find user and validate refresh token
      const user = await this.userRepository.findById(payload.userId);
      if (!user || user.refreshToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      const newTokens = this.authUtils.generateTokens({
        userId: user.id,
        email: user.email,
      });

      // Update refresh token in database
      await this.userRepository.updateRefreshToken(user.id, newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  async logout(userId: number): Promise<string> {
    await this.userRepository.removeRefreshToken(userId);
    return 'Logged out successfully';
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}