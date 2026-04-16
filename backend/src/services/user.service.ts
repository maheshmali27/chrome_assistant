import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/user.model';

export const getAll = async () => {
  const users = await User.findAll({
    where: { isActive: true },
    attributes: { exclude: ['password'] },
  });
  return users.map((u) => u.toJSON());
};

export const getById = async (id: number) => {
  const user = await User.findOne({
    where: { id, isActive: true },
    attributes: { exclude: ['password'] },
  });
  return user ? user.toJSON() : null;
};

export const update = async (id: number, data: Partial<IUser>) => {
  const user = await User.findOne({ where: { id, isActive: true } });
  if (!user) return null;

  const updateData: Partial<IUser> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.password !== undefined) updateData.password = await bcrypt.hash(data.password, 12);

  await user.update(updateData);

  const updated = user.toJSON() as IUser;
  const { password: _pw, ...userWithoutPassword } = updated;
  return userWithoutPassword;
};

export const remove = async (id: number) => {
  const user = await User.findOne({ where: { id, isActive: true } });
  if (!user) return false;

  await user.update({ isActive: false } as Partial<IUser>);
  return true;
};
