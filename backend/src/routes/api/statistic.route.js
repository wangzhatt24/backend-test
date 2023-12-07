import { Router } from 'express';
import statisticController from '../../controllers/statistic.controller.js';
import { verifyTokenAdmin } from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.get('/dashboard', verifyTokenAdmin, statisticController.dashboardInfo);

export default router;
