import { Router } from 'express';
import authRoutes from './api/auth.route.js';
import brokerRoutes from './api/broker.route.js';
import exchangeRoutes from './api/exchange.route.js';
import nhadatRoutes from './api/nhadat.route.js';
import notificationRoutes from './api/notification.route.js';
import reportRoutes from './api/report.route.js';
import statisticRoutes from './api/statistic.route.js';
import userRoutes from './api/user.route.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/nha-dat', nhadatRoutes);
router.use('/user', userRoutes);
router.use('/report', reportRoutes);
router.use('/broker', brokerRoutes);
router.use('/notification', notificationRoutes);
router.use('/exchange', exchangeRoutes);
router.use('/statistic', statisticRoutes);

export default router;
