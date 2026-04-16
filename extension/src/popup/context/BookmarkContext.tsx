import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Bookmark, BookmarkFolder, STORAGE_KEYS } from "@/types";
import { getItem, setItem } from "@/utils/storage";
import * as BookmarkAPI from "@/api/bookmarks";

interface BookmarkCtx {
  bookmarks: Bookmark[];
  folders: BookmarkFolder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addBookmark: (payload: {
    title: string;
    url: string;
    description?: string;
    folderId?: number | null;
    existingBookmarkId?: number;
  }) => Promise<void>;
  deleteBookmark: (id: number) => Promise<void>;
  toggleFavorite: (id: number, current: boolean) => Promise<void>;
  createFolder: (name: string, parentId?: number | null) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
  moveBookmark: (bookmarkId: number, folderId: number | null) => Promise<void>;
  updateBookmarkToCurrentTab: (bookmarkId: number) => Promise<void>;
  reorderBookmark: (
    bookmarkId: number,
    direction: "up" | "down",
  ) => Promise<void>;
}

const BookmarkContext = createContext<BookmarkCtx | null>(null);

export const useBookmarks = () => {
  const ctx = useContext(BookmarkContext);
  if (!ctx)
    throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
};

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLocal = async () => {
    const [localBookmarks, localFolders] = await Promise.all([
      getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS),
      getItem<BookmarkFolder[]>(STORAGE_KEYS.BOOKMARK_FOLDERS),
    ]);
    if (localBookmarks) setBookmarks(localBookmarks);
    if (localFolders) setFolders(localFolders);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiBookmarks, apiFolders] = await Promise.all([
        BookmarkAPI.getBookmarks(),
        BookmarkAPI.getFolders(),
      ]);

      // Preserve local order
      const existing =
        (await getItem<Bookmark[]>(STORAGE_KEYS.BOOKMARKS)) ?? [];
      const merged: Bookmark[] = apiBookmarks.map((b, idx) => {
        const local = existing.find((e) => e.id === b.id);
        return { ...b, order: local?.order ?? idx };
      });

      await Promise.all([
        setItem(STORAGE_KEYS.BOOKMARKS, merged),
        setItem(STORAGE_KEYS.BOOKMARK_FOLDERS, apiFolders),
      ]);
      setBookmarks(merged);
      setFolders(apiFolders);
    } catch {
      setError("Failed to sync bookmarks");
      await loadLocal();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadLocal();
      await refresh();
    })();
  }, [refresh]);

  const persistBookmarks = async (updated: Bookmark[]) => {
    setBookmarks(updated);
    await setItem(STORAGE_KEYS.BOOKMARKS, updated);
  };

  const persistFolders = async (updated: BookmarkFolder[]) => {
    setFolders(updated);
    await setItem(STORAGE_KEYS.BOOKMARK_FOLDERS, updated);
  };

  const addBookmark = async ({
    title,
    url,
    description,
    folderId,
    existingBookmarkId,
  }: {
    title: string;
    url: string;
    description?: string;
    folderId?: number | null;
    existingBookmarkId?: number;
  }) => {
    if (existingBookmarkId !== undefined) {
      const updated = await BookmarkAPI.updateBookmark(existingBookmarkId, {
        title,
        url,
        description,
        folderId,
      });
      const merged: Bookmark = { ...updated, folderId: folderId ?? null };
      await persistBookmarks(
        bookmarks.map((b) => (b.id === existingBookmarkId ? merged : b)),
      );
    } else {
      const created = await BookmarkAPI.createBookmark({
        title,
        url,
        description,
        folderId,
      });
      const merged: Bookmark = {
        ...created,
        folderId: folderId ?? null,
        order: 0,
      };
      await persistBookmarks([merged, ...bookmarks]);
    }
  };

  const deleteBookmark = async (id: number) => {
    await BookmarkAPI.deleteBookmark(id);
    await persistBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const toggleFavorite = async (id: number, current: boolean) => {
    const updated = await BookmarkAPI.updateBookmark(id, {
      isFavorite: !current,
    });
    await persistBookmarks(
      bookmarks.map((b) => (b.id === id ? { ...b, ...updated } : b)),
    );
  };

  const createFolder = async (name: string, parentId: number | null = null) => {
    const folder = await BookmarkAPI.createFolder({
      name,
      parentId,
      order: folders.length,
    });
    await persistFolders([...folders, folder]);
  };

  const deleteFolder = async (id: number) => {
    await BookmarkAPI.deleteFolder(id);
    // Backend already moves bookmarks to root; reflect that locally
    const updatedBookmarks = bookmarks.map((b) =>
      b.folderId === id ? { ...b, folderId: null } : b,
    );
    await persistBookmarks(updatedBookmarks);
    await persistFolders(folders.filter((f) => f.id !== id));
  };

  const moveBookmark = async (bookmarkId: number, folderId: number | null) => {
    const updatedBookmark = await BookmarkAPI.updateBookmark(bookmarkId, {
      folderId,
    });
    const updated = bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, ...updatedBookmark } : b,
    );
    await persistBookmarks(updated);
  };

  const updateBookmarkToCurrentTab = async (bookmarkId: number) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const nextUrl = tab?.url?.trim();
    if (!nextUrl || !/^https?:\/\//i.test(nextUrl)) return;

    const updatedBookmark = await BookmarkAPI.updateBookmark(bookmarkId, {
      url: nextUrl,
    });

    const updated = bookmarks.map((b) =>
      b.id === bookmarkId ? { ...b, ...updatedBookmark } : b,
    );
    await persistBookmarks(updated);
  };

  const reorderBookmark = async (
    bookmarkId: number,
    direction: "up" | "down",
  ) => {
    const sorted = [...bookmarks].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const idx = sorted.findIndex((b) => b.id === bookmarkId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const updated = sorted.map((b, i) => {
      if (i === idx) return { ...b, order: swapIdx };
      if (i === swapIdx) return { ...b, order: idx };
      return b;
    });
    await persistBookmarks(updated);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        folders,
        loading,
        error,
        refresh,
        addBookmark,
        deleteBookmark,
        toggleFavorite,
        createFolder,
        deleteFolder,
        moveBookmark,
        updateBookmarkToCurrentTab,
        reorderBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
