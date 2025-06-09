import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { UserRepository } from '../repositories/userRepository';
import { AuthUtils } from '../utils/auth';
import emailService from '../utils/mail';
import { signupSchema, loginSchema } from '../validation/schemas';
import { SignupInput, LoginInput, Context } from '../types';

const userRepository = new UserRepository();

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      const foundUser = await userRepository.findById(user.userId);
      if (!foundUser) {
        throw new AuthenticationError('User not found');
      }

      return {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        isVerified: foundUser.isVerified,
        createdAt: foundUser.createdAt.toISOString(),
        updatedAt: foundUser.updatedAt.toISOString(),
      };
    },
  },

  Mutation: {
    signup: async (_: any, { input }: { input: SignupInput }) => {
      // Validate input
      const { error, value } = signupSchema.validate(input);
      if (error) {
        throw new UserInputError(error.details[0].message);
      }

      const { firstName, lastName, email, password } = value;

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserInputError('User with this email already exists');
      }

      // Hash password and generate verification token
      const hashedPassword = await AuthUtils.hashPassword(password);
      const verificationToken = AuthUtils.generateVerificationToken();

      // Create user
      const user = await userRepository.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        verificationToken,
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, firstName, verificationToken);

      return 'User registered successfully! Please check your email to verify your account.';
    },

    login: async (_: any, { input }: { input: LoginInput }) => {
      // Validate input
      const { error, value } = loginSchema.validate(input);
      if (error) {
        throw new UserInputError(error.details[0].message);
      }

      const { email, password } = value;

      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isValidPassword = await AuthUtils.comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if email is verified
      if (!user.isVerified) {
        throw new ForbiddenError('Please verify your email before logging in');
      }

      // Generate tokens
      const tokens = AuthUtils.generateTokens({
        userId: user.id,
        email: user.email,
      });

      // Update refresh token in database
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

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
    },

    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }) => {
      if (!refreshToken) {
        throw new AuthenticationError('Refresh token is required');
      }

      try {
        // Verify refresh token
        const payload = AuthUtils.verifyRefreshToken(refreshToken);
        
        // Find user and validate refresh token
        const user = await userRepository.findById(payload.userId);
        if (!user || user.refreshToken !== refreshToken) {
          throw new AuthenticationError('Invalid refresh token');
        }

        // Generate new tokens
        const newTokens = AuthUtils.generateTokens({
          userId: user.id,
          email: user.email,
        });

        // Update refresh token in database
        await userRepository.updateRefreshToken(user.id, newTokens.refreshToken);

        return newTokens;
      } catch (error) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
    },

    logout: async (_: any, __: any, { user }: Context) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Remove refresh token from database
      await userRepository.removeRefreshToken(user.userId);

      return 'Logged out successfully';
    },
  },
};