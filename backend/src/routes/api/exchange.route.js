import { Router } from 'express';
import uploadPDF from '../../configs/multer-pdf.config.js';
import exchangeController from '../../controllers/exchange.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import { verifyToken } from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.post(
  '/create',
  verifyToken,
  ValidateJoi(validateSchema.exchange.create),
  exchangeController.create
);

router.get('/list/:party', verifyToken, exchangeController.getExchanges);

router.get(
  '/detail/:exchangeId',
  verifyToken,
  exchangeController.getExchangeDetail
);

router.put(
  '/accept/:exchangeId',
  verifyToken,
  uploadPDF.single('contract_pdf'),
  ValidateJoi(validateSchema.exchange.accept),
  exchangeController.acceptExchange
);

router.put(
  '/cancel/:exchangeId',
  verifyToken,
  ValidateJoi(validateSchema.exchange.cancel),
  exchangeController.cancelExchange
);

export default router;
