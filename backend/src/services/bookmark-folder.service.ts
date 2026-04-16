import BookmarkFolder, { IBookmarkFolder } from '../models/bookmark-folder.model';
import Bookmark from '../models/bookmark.model';

export const getAll = async (userId: number) => {
  const folders = await BookmarkFolder.findAll({
    where: { userId },
    order: [['order', 'ASC']],
  });
  return folders.map((f) => f.toJSON());
};

export const getById = async (userId: number, id: number) => {
  const folder = await BookmarkFolder.findOne({ where: { id, userId } });
  return folder ? folder.toJSON() : null;
};

export const create = async (
  userId: number,
  data: Pick<IBookmarkFolder, 'name'> & Partial<Pick<IBookmarkFolder, 'parentId' | 'order'>>
) => {
  const count = await BookmarkFolder.count({ where: { userId } });
  const folder = await BookmarkFolder.create({
    userId,
    name: data.name,
    parentId: data.parentId ?? null,
    order: data.order ?? count,
  });
  return folder.toJSON();
};

export const update = async (userId: number, id: number, data: Partial<IBookmarkFolder>) => {
  const folder = await BookmarkFolder.findOne({ where: { id, userId } });
  if (!folder) return null;

  const updateData: Partial<IBookmarkFolder> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;
  if (data.order !== undefined) updateData.order = data.order;

  await folder.update(updateData);
  return folder.toJSON();
};

export const remove = async (userId: number, id: number) => {
  const folder = await BookmarkFolder.findOne({ where: { id, userId } });
  if (!folder) return false;

  // Move bookmarks in this folder to root before deleting
  await Bookmark.update({ folderId: null } as never, { where: { folderId: id, userId } });
  await folder.destroy();
  return true;
};
