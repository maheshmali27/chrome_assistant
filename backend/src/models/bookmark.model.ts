import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.db';
import User from './user.model';

export interface IBookmark {
  id: number;
  userId: number;
  folderId?: number | null;
  title: string;
  url: string;
  description?: string | null;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const Bookmark = sequelize.define<
  Model<IBookmark, Omit<IBookmark, 'id' | 'createdAt' | 'updatedAt'>>
>(
  'bookmarks',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: 'bookmark_folders', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'bookmarks',
    freezeTableName: true,
    timestamps: true,
  }
);

import BookmarkFolder from './bookmark-folder.model';

User.hasMany(Bookmark, { foreignKey: 'userId' });
Bookmark.belongsTo(User, { foreignKey: 'userId' });
BookmarkFolder.hasMany(Bookmark, { foreignKey: 'folderId', as: 'bookmarks' });
Bookmark.belongsTo(BookmarkFolder, { foreignKey: 'folderId', as: 'folder' });

export default Bookmark;
