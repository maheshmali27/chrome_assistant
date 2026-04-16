import express from 'express';
import * as FolderController from '../controllers/bookmark-folder.controller';
import * as AuthMiddleware from '../middlewares/auth.middleware';
import P from '../../constant/permissions';

const router = express.Router();

router.use(AuthMiddleware.validateToken);

router
  .route('/')
  .get(
    AuthMiddleware.restrictTo(P.view_bookmark_folders, P.manage_bookmark_folders),
    FolderController.getMyFolders
  )
  .post(
    AuthMiddleware.restrictTo(P.create_bookmark_folder, P.manage_bookmark_folders),
    FolderController.createFolder
  );

router
  .route('/:id')
  .get(
    AuthMiddleware.restrictTo(P.view_bookmark_folders, P.manage_bookmark_folders),
    FolderController.getFolderById
  )
  .put(
    AuthMiddleware.restrictTo(P.update_bookmark_folder, P.manage_bookmark_folders),
    FolderController.updateFolder
  )
  .delete(
    AuthMiddleware.restrictTo(P.delete_bookmark_folder, P.manage_bookmark_folders),
    FolderController.deleteFolder
  );

export default router;
