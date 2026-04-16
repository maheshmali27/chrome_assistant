interface CreateFolderData {
  name?: string;
  parentId?: number | null;
  order?: number;
}

interface UpdateFolderData {
  name?: string;
  parentId?: number | null;
  order?: number;
}

type ValidationResult = { status: boolean; error: string };

export const validateCreateFolder = (data: CreateFolderData): ValidationResult => {
  if (!data.name?.trim()) return { status: false, error: 'Folder name is required' };
  if (data.name.trim().length > 150) {
    return { status: false, error: 'Folder name must be less than 150 characters' };
  }
  return { status: true, error: '' };
};

export const validateUpdateFolder = (data: UpdateFolderData): ValidationResult => {
  if (data.name === undefined && data.parentId === undefined && data.order === undefined) {
    return { status: false, error: 'Provide at least one field to update' };
  }
  if (data.name !== undefined && !data.name.trim()) {
    return { status: false, error: 'Folder name cannot be empty' };
  }
  if (data.name !== undefined && data.name.trim().length > 150) {
    return { status: false, error: 'Folder name must be less than 150 characters' };
  }
  return { status: true, error: '' };
};
