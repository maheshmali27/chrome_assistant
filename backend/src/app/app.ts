import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

import Env from '../constant/env';
import AppError from '../utils/appError';
import { permissionsPolicy } from '../utils/securityHeaders';
import globalErrorHandler from './controllers/error.controller';

// Import routes
import authRoute from './routes/auth.route';
import userRoute from './routes/user.routes';
import bookmarkRoute from './routes/bookmark.routes';
import bookmarkFolderRoute from './routes/bookmark-folder.routes';

const app = express();

app.set('trust proxy', 1);

app.use(cors({ origin: Env.NODE_ENV === 'development' ? '*' : Env.CORS_ORIGIN }));
app.use(helmet());
app.use(permissionsPolicy);
app.use(express.json({ limit: '4096kb' }));
app.use(express.urlencoded({ extended: true, limit: '4096kb' }));
app.use(compression());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/bookmarks', bookmarkRoute);
app.use('/api/v1/bookmark-folders', bookmarkFolderRoute);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
