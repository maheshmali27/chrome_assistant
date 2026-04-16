import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Env from '../constant/env';
import AppError from '../utils/appError';
import User, { IUser } from '../models/user.model';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) return null;

  const userData = user.toJSON() as IUser;
  const isPasswordValid = await bcrypt.compare(password, userData.password);
  if (!isPasswordValid) return null;

  const token = jwt.sign({ id: userData.id }, Env.JWT_SECRET, {
    expiresIn: Env.JWT_EXPIRES_IN,
    issuer: Env.JWT_ISSUER,
  } as jwt.SignOptions) as string;

  const { password: _pw, ...userWithoutPassword } = userData;
  return { token, user: userWithoutPassword };
};

export const register = async (data: RegisterData) => {
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) throw new AppError('Email already in use', 409);

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role || 'user',
    isActive: true,
  } as Omit<IUser, 'id'>);

  const userData = user.toJSON() as IUser;
  const { password: _pw, ...userWithoutPassword } = userData;
  return userWithoutPassword;
};
