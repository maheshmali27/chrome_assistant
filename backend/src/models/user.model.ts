import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.db';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const User = sequelize.define<Model<IUser, Omit<IUser, 'id'>>>(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'user',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    freezeTableName: true,
    timestamps: true,
  }
);

export default User;
