import { Request, Response, NextFunction } from 'express';

import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import * as AuthService from '../../services/auth.service';
import { validateLogin, validateRegister } from '../../validations/user.validations';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, error } = validateLogin(req.body);
  if (!status) return next(new AppError(error, 400));

  const result = await AuthService.login(req.body.email, req.body.password);
  if (!result) return next(new AppError('Invalid email or password', 401));

  res.json({ status: 'success', message: 'Login successful', data: result });
});

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, error } = validateRegister(req.body);
  if (!status) return next(new AppError(error, 400));

  const data = await AuthService.register(req.body);
  res.status(201).json({ status: 'success', message: 'User registered successfully', data });
});
