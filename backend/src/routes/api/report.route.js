import { Router } from 'express';
import reportController from '../../controllers/report.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import { verifyTokenAdmin } from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.get('/list', reportController.getListReports);

router.post(
  '/create',
  ValidateJoi(validateSchema.report.create),
  reportController.create
);

router.put(
  '/reply-report/:reportId',
  verifyTokenAdmin,
  ValidateJoi(validateSchema.report.handleReplyReport),
  reportController.handleReport
);

export default router;
