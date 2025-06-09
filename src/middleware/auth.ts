import { Request } from 'express';
import { AuthUtils } from '../utils/auth';
import { Context } from '../types';

export const getContext = ({ req }: { req: Request }): Context => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return {};
  }

  try {
    const user = AuthUtils.verifyAccessToken(token);
    return { user };
  } catch (error) {
    return {};
  }
};