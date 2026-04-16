const P = {
  // User permissions
  view_users: 'view_users',
  create_user: 'create_user',
  update_user: 'update_user',
  delete_user: 'delete_user',
  manage_users: 'manage_users',

  // Bookmark permissions
  view_bookmarks: 'view_bookmarks',
  create_bookmark: 'create_bookmark',
  update_bookmark: 'update_bookmark',
  delete_bookmark: 'delete_bookmark',
  manage_bookmarks: 'manage_bookmarks',

  // Bookmark folder permissions
  view_bookmark_folders: 'view_bookmark_folders',
  create_bookmark_folder: 'create_bookmark_folder',
  update_bookmark_folder: 'update_bookmark_folder',
  delete_bookmark_folder: 'delete_bookmark_folder',
  manage_bookmark_folders: 'manage_bookmark_folders',
} as const;

export default P;
