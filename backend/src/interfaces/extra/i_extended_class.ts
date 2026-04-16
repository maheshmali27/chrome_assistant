import { Request } from 'express';
import { IUser } from '../../models/user.model';

export interface IUserRequest extends Request {
  user?: IUser & { permissions?: string[] };
}
