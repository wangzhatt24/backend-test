import { Router } from 'express';
import upload from '../../configs/multer.config.js';
import userController from '../../controllers/user.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import {
  verifyToken,
  verifyTokenAdmin,
} from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.get('/pb/:user_id', userController.getInfoUserPublic); // pb la public

router.get('/info', verifyToken, userController.getInfoUserPrivate);

router.put(
  '/update-info',
  verifyToken,
  ValidateJoi(validateSchema.user.updateInfo),
  userController.updateInfo
);

router.put(
  '/set-avatar',
  verifyToken,
  upload.single('avatar'),
  userController.setAvatar
);

router.put(
  '/update-password',
  verifyToken,
  ValidateJoi(validateSchema.user.updatePassword),
  userController.updatePassword
);

router.post(
  '/forget-password',
  ValidateJoi(validateSchema.user.forgetPassword),
  userController.forgetPassword
);

router.post(
  '/reset-password',
  ValidateJoi(validateSchema.user.resetPassword),
  userController.resetPassword
);

// -----------admin

router.get(
  '/users',
  //verifyTokenAdmin,
  userController.getUsers
);

router.get(
  '/admin/detail/:userId',
  verifyTokenAdmin,
  userController.getDetailUserAdmin
);

router.put(
  '/lock-user/:userId',
  verifyTokenAdmin,
  ValidateJoi(validateSchema.user.locked),
  userController.lockUser
);

router.put('/unlock-user/:userId', verifyTokenAdmin, userController.unlockUser);

export default router;
