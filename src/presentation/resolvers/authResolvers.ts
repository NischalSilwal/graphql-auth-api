import { AuthenticationError, UserInputError } from 'apollo-server-express';

import { AuthService } from '../../application/services/AuthService';
import { loginSchema, signupSchema } from '../schema/schemas';
import { container } from '../../infrastructure/di/inversify.config';
import { TYPES } from '../../infrastructure/di/types';


const authService = container.get<AuthService>(TYPES.AuthService);

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, { user }: any) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      try {
        return authService.getProfile(user.userId);
      } catch (error) {
        throw new AuthenticationError('User not found');
      }
    },
  },

  Mutation: {
    signup: async (_: any, { input }: any) => {
      // Validate input
      const { error, value } = signupSchema.validate(input);
      if (error) {
        throw new UserInputError(error.details[0].message);
      }

      return authService.signup(value);
    },

    login: async (_: any, { input }: any) => {
      // Validate input
      const { error, value } = loginSchema.validate(input);
      if (error) {
        throw new UserInputError(error.details[0].message);
      }

      return authService.login(value);
    },

    refreshToken: async (_: any, { refreshToken }: any) => {
      return authService.refreshToken(refreshToken);
    },

    logout: async (_: any, __: any, { user }: any) => {
      if (!user) {
        throw new AuthenticationError('Not authenticated');
      }

      return authService.logout(user.userId);
    },
  },
};