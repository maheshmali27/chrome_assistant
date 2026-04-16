import Bookmark, { IBookmark } from '../models/bookmark.model';
import BookmarkHistory from '../models/bookmark.history.model';

export const create = async (
  userId: number,
  data: Pick<IBookmark, 'title' | 'url'> & Partial<Pick<IBookmark, 'description' | 'isFavorite' | 'folderId'>>
) => {
  const bookmark = await Bookmark.create({
    userId,
    title: data.title,
    url: data.url,
    description: data.description ?? null,
    isFavorite: data.isFavorite ?? false,
    folderId: data.folderId ?? null,
  });

  return bookmark.toJSON();
};

export const getAll = async (userId: number) => {
  const bookmarks = await Bookmark.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  return bookmarks.map((bookmark) => bookmark.toJSON());
};

export const getById = async (userId: number, id: number) => {
  const bookmark = await Bookmark.findOne({ where: { id, userId } });
  return bookmark ? bookmark.toJSON() : null;
};

export const update = async (userId: number, id: number, data: Partial<IBookmark>) => {
  const bookmark = await Bookmark.findOne({ where: { id, userId } });
  if (!bookmark) return null;

  const current = bookmark.toJSON() as IBookmark;

  if (data.url !== undefined && data.url !== current.url) {
    await BookmarkHistory.create({
      bookmarkId: current.id,
      title: current.title,
      url: current.url,
      description: current.description ?? null,
      isFavorite: current.isFavorite,
    });
  }

  const updateData: Partial<IBookmark> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.url !== undefined) updateData.url = data.url;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;
  if (data.folderId !== undefined) updateData.folderId = data.folderId ?? null;

  await bookmark.update(updateData);
  return bookmark.toJSON();
};

export const getHistory = async (userId: number, bookmarkId: number) => {
  const bookmark = await Bookmark.findOne({ where: { id: bookmarkId, userId } });
  if (!bookmark) return null;

  const history = await BookmarkHistory.findAll({
    where: { bookmarkId },
    order: [['createdAt', 'DESC']],
  });

  return history.map((h) => h.toJSON());
};

export const remove = async (userId: number, id: number) => {
  const deletedCount = await Bookmark.destroy({ where: { id, userId } });
  return deletedCount > 0;
};

export const bulkCreate = async (
  userId: number,
  items: Array<
    Pick<IBookmark, 'title' | 'url'> & Partial<Pick<IBookmark, 'description' | 'isFavorite' | 'folderId'>>
  >
) => {
  const succeeded: IBookmark[] = [];
  const failed: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const bookmark = await create(userId, items[i]);
      succeeded.push(bookmark as IBookmark);
    } catch {
      failed.push({ index: i, error: 'Failed to create bookmark' });
    }
  }

  return { succeeded, failed };
};

export const bulkUpdate = async (
  userId: number,
  items: Array<{ id: number } & Partial<IBookmark>>
) => {
  const succeeded: IBookmark[] = [];
  const failed: Array<{ index: number; id: number; error: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const { id, ...data } = items[i];
    try {
      const result = await update(userId, id, data);
      if (!result) {
        failed.push({ index: i, id, error: 'Bookmark not found' });
      } else {
        succeeded.push(result as IBookmark);
      }
    } catch {
      failed.push({ index: i, id, error: 'Failed to update bookmark' });
    }
  }

  return { succeeded, failed };
};
