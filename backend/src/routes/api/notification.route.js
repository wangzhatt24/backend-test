import { Router } from 'express';
import notificationController from '../../controllers/notification.controller.js';
import { verifyToken } from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.get('/list', verifyToken, notificationController.getNotifications);

router.put('/mark-read/:id', verifyToken, notificationController.markAsRead);

router.delete(
  '/delete/:id',
  verifyToken,
  notificationController.deleteNotification
);

export default router;
