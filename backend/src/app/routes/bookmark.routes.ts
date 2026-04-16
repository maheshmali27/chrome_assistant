import express from 'express';
import * as BookmarkController from '../controllers/bookmark.controller';
import * as AuthMiddleware from '../middlewares/auth.middleware';
import P from '../../constant/permissions';

const router = express.Router();

router.use(AuthMiddleware.validateToken);

router
  .route('/bulk')
  .post(
    AuthMiddleware.restrictTo(P.create_bookmark, P.manage_bookmarks),
    BookmarkController.bulkCreateBookmarks
  )
  .put(
    AuthMiddleware.restrictTo(P.update_bookmark, P.manage_bookmarks),
    BookmarkController.bulkUpdateBookmarks
  );

router
  .route('/')
  .get(
    AuthMiddleware.restrictTo(P.view_bookmarks, P.manage_bookmarks),
    BookmarkController.getMyBookmarks
  )
  .post(
    AuthMiddleware.restrictTo(P.create_bookmark, P.manage_bookmarks),
    BookmarkController.createBookmark
  );

router
  .route('/:id/history')
  .get(
    AuthMiddleware.restrictTo(P.view_bookmarks, P.manage_bookmarks),
    BookmarkController.getBookmarkHistory
  );

router
  .route('/:id')
  .get(
    AuthMiddleware.restrictTo(P.view_bookmarks, P.manage_bookmarks),
    BookmarkController.getBookmarkById
  )
  .put(
    AuthMiddleware.restrictTo(P.update_bookmark, P.manage_bookmarks),
    BookmarkController.updateBookmark
  )
  .delete(
    AuthMiddleware.restrictTo(P.delete_bookmark, P.manage_bookmarks),
    BookmarkController.deleteBookmark
  );

export default router;
