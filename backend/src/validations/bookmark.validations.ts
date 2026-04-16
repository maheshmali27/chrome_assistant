interface CreateBookmarkData {
  title?: string;
  url?: string;
  description?: string;
  isFavorite?: boolean;
  folderId?: number | null;
}

interface UpdateBookmarkData {
  title?: string;
  url?: string;
  description?: string;
  isFavorite?: boolean;
  folderId?: number | null;
}

type ValidationResult = { status: boolean; error: string };

const URL_REGEX = /^https?:\/\/.+/i;

export const validateCreateBookmark = (data: CreateBookmarkData): ValidationResult => {
  if (!data.title?.trim()) return { status: false, error: 'Title is required' };
  if (!data.url?.trim()) return { status: false, error: 'URL is required' };
  if (!URL_REGEX.test(data.url)) {
    return { status: false, error: 'URL must start with http:// or https://' };
  }
  if (data.description !== undefined && data.description.length > 1000) {
    return { status: false, error: 'Description must be less than 1000 characters' };
  }

  return { status: true, error: '' };
};

export const validateUpdateBookmark = (data: UpdateBookmarkData): ValidationResult => {
  if (
    data.title === undefined &&
    data.url === undefined &&
    data.description === undefined &&
    data.isFavorite === undefined &&
    data.folderId === undefined
  ) {
    return { status: false, error: 'Provide at least one field to update' };
  }

  if (data.title !== undefined && !data.title.trim()) {
    return { status: false, error: 'Title cannot be empty' };
  }

  if (data.url !== undefined) {
    if (!data.url.trim()) return { status: false, error: 'URL cannot be empty' };
    if (!URL_REGEX.test(data.url)) {
      return { status: false, error: 'URL must start with http:// or https://' };
    }
  }

  if (data.description !== undefined && data.description.length > 1000) {
    return { status: false, error: 'Description must be less than 1000 characters' };
  }

  if (
    data.folderId !== undefined &&
    data.folderId !== null &&
    (typeof data.folderId !== 'number' || Number.isNaN(data.folderId))
  ) {
    return { status: false, error: 'folderId must be a number or null' };
  }

  return { status: true, error: '' };
};
