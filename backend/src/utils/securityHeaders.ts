import { Request, Response, NextFunction } from 'express';

export const permissionsPolicy = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
};
