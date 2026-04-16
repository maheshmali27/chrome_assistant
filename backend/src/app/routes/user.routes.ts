import express from 'express';
import * as UserController from '../controllers/user.controller';
import * as AuthMiddleware from '../middlewares/auth.middleware';
import P from '../../constant/permissions';

const router = express.Router();

router.use(AuthMiddleware.validateToken);

router
  .route('/')
  .get(AuthMiddleware.restrictTo(P.view_users, P.manage_users), UserController.getAllUsers);

router
  .route('/:id')
  .get(AuthMiddleware.restrictTo(P.view_users, P.manage_users), UserController.getUserById)
  .put(AuthMiddleware.restrictTo(P.update_user, P.manage_users), UserController.updateUser)
  .delete(AuthMiddleware.restrictTo(P.delete_user, P.manage_users), UserController.deleteUser);

export default router;
