// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export interface Bookmark {
  id: number;
  userId: number;
  folderId?: number | null;
  title: string;
  url: string;
  description?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  // Local-only field
  order?: number;
}

export interface BookmarkHistory {
  id: number;
  bookmarkId: number;
  title: string;
  url: string;
  description?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkFolder {
  id: number;
  userId: number;
  name: string;
  parentId: number | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateBookmarkPayload = {
  title: string;
  url: string;
  description?: string;
  isFavorite?: boolean;
  folderId?: number | null;
};

export type UpdateBookmarkPayload = Partial<CreateBookmarkPayload>;

// ── Storage keys ──────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  AUTH_LOGIN_TIME: "auth_login_time",
  PASSCODE_HASH: "passcode_hash",
  PASSCODE_LAST_UNLOCK: "passcode_last_unlock",
  BOOKMARKS: "bookmarks",
  BOOKMARK_FOLDERS: "bookmark_folders",
  BOOKMARKS_LAST_SYNCED: "bookmarks_last_synced",
  SETTINGS: "settings",
} as const;

export interface Settings {
  passcodeTimeoutMinutes: number; // default: 10
  tokenExpireDays: number; // default: 7
  syncEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  passcodeTimeoutMinutes: 10,
  tokenExpireDays: 7,
  syncEnabled: true,
};

// ── Message types (popup ↔ background ↔ content) ─────────────────────────────
export type MessageType =
  | "GET_BOOKMARK_STATUS"
  | "ADD_BOOKMARK_FROM_CONTENT"
  | "SYNC_BOOKMARKS"
  | "GET_PASSCODE_LOCK_STATUS";

export interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
}
