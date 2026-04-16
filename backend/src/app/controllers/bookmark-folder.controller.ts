import { Response, NextFunction } from 'express';

import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import * as FolderService from '../../services/bookmark-folder.service';
import { IUserRequest } from '../../interfaces/extra/i_extended_class';
import {
  validateCreateFolder,
  validateUpdateFolder,
} from '../../validations/bookmark-folder.validations';

export const getMyFolders = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const data = await FolderService.getAll(req.user.id);
    res.json({ status: 'success', data });
  }
);

export const getFolderById = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid folder id', 400));

    const data = await FolderService.getById(req.user.id, id);
    if (!data) return next(new AppError('Folder not found', 404));

    res.json({ status: 'success', data });
  }
);

export const createFolder = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const { status, error } = validateCreateFolder(req.body);
    if (!status) return next(new AppError(error, 400));

    const data = await FolderService.create(req.user.id, req.body);
    res.status(201).json({ status: 'success', message: 'Folder created successfully', data });
  }
);

export const updateFolder = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid folder id', 400));

    const { status, error } = validateUpdateFolder(req.body);
    if (!status) return next(new AppError(error, 400));

    const data = await FolderService.update(req.user.id, id, req.body);
    if (!data) return next(new AppError('Folder not found', 404));

    res.json({ status: 'success', message: 'Folder updated successfully', data });
  }
);

export const deleteFolder = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid folder id', 400));

    const success = await FolderService.remove(req.user.id, id);
    if (!success) return next(new AppError('Folder not found', 404));

    res.json({ status: 'success', message: 'Folder deleted successfully', data: null });
  }
);
