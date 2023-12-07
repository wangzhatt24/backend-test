import { Router } from 'express';
import authController from '../../controllers/auth.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import { limiterLogin } from '../../middleware/limiter.middleware.js';

const router = Router();

router.post(
  '/signup',
  ValidateJoi(validateSchema.auth.signUp),
  authController.signUp
);

router.post('/signin', limiterLogin, authController.signIn);

router.post('/refresh-token', authController.refreshToken);

router.delete('/signout', authController.signOut);

// admin route

router.post('/admin/signin', limiterLogin, authController.adminSignIn);

router.post('/admin/refresh-token', authController.refreshTokenAdmin);

router.delete('/admin/signout', authController.signOutAdmin);

export default router;
