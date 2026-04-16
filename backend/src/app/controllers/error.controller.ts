import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';

import Env from '../../constant/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err?.statusCode || 500;
  let status = err?.status || 'error';
  let errMessage = err.message;

  if (err instanceof SequelizeValidationError) {
    errMessage = err.errors.map((el) => el.message).join('. ');
    statusCode = 400;
    status = 'fail';
  }

  if (err instanceof UniqueConstraintError) {
    errMessage = err.errors.map((el) => el.message).join('. ');
    statusCode = 400;
    status = 'fail';
  }

  if (Env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);

    return res.status(statusCode).json({
      status,
      error: err,
      message: errMessage,
    });
  }

  return res.status(statusCode).json({
    status,
    message: errMessage,
  });
};
