import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize.db';
import Bookmark from './bookmark.model';

export interface IBookmarkHistory {
  id: number;
  bookmarkId: number;
  title: string;
  url: string;
  description?: string | null;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookmarkHistory = sequelize.define<
  Model<IBookmarkHistory, Omit<IBookmarkHistory, 'id' | 'createdAt' | 'updatedAt'>>
>(
  'bookmark_history',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bookmarkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookmarks',
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
    isFavorite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'bookmark_history',
    freezeTableName: true,
    timestamps: true,
  }
);

Bookmark.hasMany(BookmarkHistory, { foreignKey: 'bookmarkId' });
BookmarkHistory.belongsTo(Bookmark, { foreignKey: 'bookmarkId' });

export default BookmarkHistory;
