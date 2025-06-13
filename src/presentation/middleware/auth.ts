import { Request } from 'express';
import { IAuthService } from '../../domain/interfaces/services/IAuthService';
import { container } from '../../infrastructure/di/inversify.config';
import { TYPES } from '../../infrastructure/di/types';

const authUtils = container.get<IAuthService>(TYPES.AuthUtils);

export const getContext = ({ req }: { req: Request }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return {};
  }

  try {
    const user = authUtils.verifyAccessToken(token);
    return { user };
  } catch (error) {
    return {};
  }
};