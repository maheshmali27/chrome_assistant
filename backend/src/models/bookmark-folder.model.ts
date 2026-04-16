import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.db';
import User from './user.model';

export interface IBookmarkFolder {
  id: number;
  userId: number;
  name: string;
  parentId?: number | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookmarkFolder = sequelize.define<
  Model<IBookmarkFolder, Omit<IBookmarkFolder, 'id' | 'createdAt' | 'updatedAt'>>
>(
  'bookmark_folders',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'bookmark_folders',
    freezeTableName: true,
    timestamps: true,
  }
);

User.hasMany(BookmarkFolder, { foreignKey: 'userId', as: 'bookmarkFolders' });
BookmarkFolder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default BookmarkFolder;
