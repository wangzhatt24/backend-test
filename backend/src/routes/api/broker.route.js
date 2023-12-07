import { Router } from 'express';
import brokerController from '../../controllers/broker.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import { verifyToken } from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.post(
  '/create',
  verifyToken,
  ValidateJoi(validateSchema.broker.create),
  brokerController.create
);

router.put(
  '/update',
  verifyToken,
  ValidateJoi(validateSchema.broker.create),
  brokerController.update
);

router.get('/detail-by-user', verifyToken, brokerController.getDetailByUser);

router.delete('/delete', verifyToken, brokerController.deleteBroker);

// public

router.get('/list', brokerController.getList);

router.get('/detail/:brokerId', brokerController.getDetailBroker);

router.get('/top', brokerController.getTopBrokers);

export default router;
