import { Response, NextFunction } from 'express';

import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import * as BookmarkService from '../../services/bookmark.service';
import { IUserRequest } from '../../interfaces/extra/i_extended_class';
import {
  validateCreateBookmark,
  validateUpdateBookmark,
} from '../../validations/bookmark.validations';

export const createBookmark = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const { status, error } = validateCreateBookmark(req.body);
    if (!status) return next(new AppError(error, 400));

    const data = await BookmarkService.create(req.user.id, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Bookmark created successfully',
      data,
    });
  }
);

export const getMyBookmarks = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const data = await BookmarkService.getAll(req.user.id);
    res.json({ status: 'success', data });
  }
);

export const getBookmarkById = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid bookmark id', 400));

    const data = await BookmarkService.getById(req.user.id, id);
    if (!data) return next(new AppError('Bookmark not found', 404));

    res.json({ status: 'success', data });
  }
);

export const updateBookmark = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid bookmark id', 400));

    const { status, error } = validateUpdateBookmark(req.body);
    if (!status) return next(new AppError(error, 400));

    const data = await BookmarkService.update(req.user.id, id, req.body);
    if (!data) return next(new AppError('Bookmark not found', 404));

    res.json({
      status: 'success',
      message: 'Bookmark updated successfully',
      data,
    });
  }
);

export const deleteBookmark = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid bookmark id', 400));

    const success = await BookmarkService.remove(req.user.id, id);
    if (!success) return next(new AppError('Bookmark not found', 404));

    res.json({
      status: 'success',
      message: 'Bookmark deleted successfully',
      data: null,
    });
  }
);

export const getBookmarkHistory = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Invalid bookmark id', 400));

    const data = await BookmarkService.getHistory(req.user.id, id);
    if (!data) return next(new AppError('Bookmark not found', 404));

    res.json({ status: 'success', data });
  }
);

export const bulkCreateBookmarks = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const { bookmarks } = req.body as { bookmarks: unknown[] };
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return next(new AppError('bookmarks must be a non-empty array', 400));
    }

    type CreateItem = Parameters<typeof BookmarkService.bulkCreate>[1][number];
    const validItems: CreateItem[] = [];
    const validIndices: number[] = [];
    const failed: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < bookmarks.length; i++) {
      const item = bookmarks[i] as Record<string, unknown>;
      const { status, error } = validateCreateBookmark(item);
      if (!status) {
        failed.push({ index: i, error });
      } else {
        validItems.push(item as CreateItem);
        validIndices.push(i);
      }
    }

    const serviceResult = await BookmarkService.bulkCreate(req.user.id, validItems);

    const allFailed = [
      ...failed,
      ...serviceResult.failed.map((f) => ({ index: validIndices[f.index], error: f.error })),
    ].sort((a, b) => a.index - b.index);

    res.status(200).json({
      status: 'success',
      message: 'Bulk create completed',
      data: { succeeded: serviceResult.succeeded, failed: allFailed },
    });
  }
);

export const bulkUpdateBookmarks = catchAsync(
  async (req: IUserRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) return next(new AppError('Login to access this resource', 401));

    const { bookmarks } = req.body as { bookmarks: unknown[] };
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return next(new AppError('bookmarks must be a non-empty array', 400));
    }

    type UpdateItem = Parameters<typeof BookmarkService.bulkUpdate>[1][number];
    const validItems: UpdateItem[] = [];
    const validIndices: number[] = [];
    const failed: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < bookmarks.length; i++) {
      const item = bookmarks[i] as Record<string, unknown>;
      const id = Number(item.id);
      if (!item.id || isNaN(id)) {
        failed.push({ index: i, error: 'id is required and must be a number' });
        continue;
      }

      const { status, error } = validateUpdateBookmark(item);
      if (!status) {
        failed.push({ index: i, error });
        continue;
      }

      validItems.push({ ...item, id } as UpdateItem);
      validIndices.push(i);
    }

    const serviceResult = await BookmarkService.bulkUpdate(req.user.id, validItems);

    const allFailed = [
      ...failed,
      ...serviceResult.failed.map((f) => ({ index: validIndices[f.index], error: f.error })),
    ].sort((a, b) => a.index - b.index);

    res.status(200).json({
      status: 'success',
      message: 'Bulk update completed',
      data: { succeeded: serviceResult.succeeded, failed: allFailed },
    });
  }
);
