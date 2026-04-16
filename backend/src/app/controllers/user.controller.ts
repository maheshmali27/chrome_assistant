import { Request, Response, NextFunction } from 'express';

import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import * as UserService from '../../services/user.service';
import { validateUpdateUser } from '../../validations/user.validations';

export const getAllUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
  const data = await UserService.getAll();
  res.json({ status: 'success', data });
});

export const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return next(new AppError('Invalid user id', 400));

  const data = await UserService.getById(id);
  if (!data) return next(new AppError('User not found', 404));

  res.json({ status: 'success', data });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return next(new AppError('Invalid user id', 400));

  const { status, error } = validateUpdateUser(req.body);
  if (!status) return next(new AppError(error, 400));

  const data = await UserService.update(id, req.body);
  if (!data) return next(new AppError('User not found', 404));

  res.json({ status: 'success', message: 'User updated successfully', data });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return next(new AppError('Invalid user id', 400));

  const success = await UserService.remove(id);
  if (!success) return next(new AppError('User not found', 404));

  res.json({ status: 'success', message: 'User deleted successfully', data: null });
});
