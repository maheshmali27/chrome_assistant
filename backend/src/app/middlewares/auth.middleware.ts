import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import User, { IUser } from '../../models/user.model';
import { IUserRequest } from '../../interfaces/extra/i_extended_class';
import Env from '../../constant/env';

export const validateToken = catchAsync(
  async (req: IUserRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Login to access this resource', 401));
    }

    const token = authHeader.split(' ')[1];

    let decoded: { id: number };
    try {
      decoded = jwt.verify(token, Env.JWT_SECRET, { issuer: Env.JWT_ISSUER }) as { id: number };
    } catch {
      return next(new AppError('Invalid or expired token', 401));
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return next(new AppError('Invalid user details', 404));

    const userData = user.toJSON() as IUser;
    if (!userData.isActive) return next(new AppError('Your account has been deactivated', 401));

    req.user = userData;
    next();
  }
);

export const restrictTo = (...permissions: string[]) => {
  return (req: IUserRequest, _res: Response, next: NextFunction) => {
    if (req.user?.role?.toLowerCase() === 'admin') return next();

    const userPermissions: string[] = req.user?.permissions || [];
    const hasPermission = permissions.some((perm) => userPermissions.includes(perm));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
