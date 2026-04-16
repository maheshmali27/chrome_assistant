import apiClient from "./client";
import {
  Bookmark,
  BookmarkFolder,
  BookmarkHistory,
  CreateBookmarkPayload,
  UpdateBookmarkPayload,
} from "@/types";

interface ListResponse<T> {
  status: string;
  data: T[];
}

interface SingleResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const res = await apiClient.get<ListResponse<Bookmark>>("/bookmarks");
  return res.data.data;
};

export const createBookmark = async (
  payload: CreateBookmarkPayload,
): Promise<Bookmark> => {
  const res = await apiClient.post<SingleResponse<Bookmark>>(
    "/bookmarks",
    payload,
  );
  return res.data.data;
};

export const updateBookmark = async (
  id: number,
  payload: UpdateBookmarkPayload,
): Promise<Bookmark> => {
  const res = await apiClient.put<SingleResponse<Bookmark>>(
    `/bookmarks/${id}`,
    payload,
  );
  return res.data.data;
};

export const deleteBookmark = async (id: number): Promise<void> => {
  await apiClient.delete(`/bookmarks/${id}`);
};

export const getBookmarkHistory = async (
  id: number,
): Promise<BookmarkHistory[]> => {
  const res = await apiClient.get<ListResponse<BookmarkHistory>>(
    `/bookmarks/${id}/history`,
  );
  return res.data.data;
};

// ── Bookmark Folders ──────────────────────────────────────────────────────────

export const getFolders = async (): Promise<BookmarkFolder[]> => {
  const res =
    await apiClient.get<ListResponse<BookmarkFolder>>("/bookmark-folders");
  return res.data.data;
};

export const createFolder = async (payload: {
  name: string;
  parentId?: number | null;
  order?: number;
}): Promise<BookmarkFolder> => {
  const res = await apiClient.post<SingleResponse<BookmarkFolder>>(
    "/bookmark-folders",
    payload,
  );
  return res.data.data;
};

export const updateFolder = async (
  id: number,
  payload: { name?: string; parentId?: number | null; order?: number },
): Promise<BookmarkFolder> => {
  const res = await apiClient.put<SingleResponse<BookmarkFolder>>(
    `/bookmark-folders/${id}`,
    payload,
  );
  return res.data.data;
};

export const deleteFolder = async (id: number): Promise<void> => {
  await apiClient.delete(`/bookmark-folders/${id}`);
};
