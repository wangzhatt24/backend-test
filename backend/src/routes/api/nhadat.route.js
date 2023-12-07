import { Router } from 'express';
import upload from '../../configs/multer.config.js';
import nhadatController from '../../controllers/nhadat.controller.js';
import {
  ValidateJoi,
  validateSchema,
} from '../../middleware/joi.middleware.js';
import {
  verifyToken,
  verifyTokenAdmin,
} from '../../middleware/verifyToken.middleware.js';

const router = Router();

router.get('/list/:demand', nhadatController.queryNhaDat);

router.get('/user/list', verifyToken, nhadatController.queryNhaDatOfUser);

router.get('/detail/:slug', nhadatController.getNhaDatDetail);

router.get(
  '/user/detail/:slug',
  verifyToken,
  nhadatController.getNhaDatDetailOfUser
);

router.post(
  '/create',
  verifyToken,
  upload.array('collections', 10),
  ValidateJoi(validateSchema.nhadat.create),
  nhadatController.create
);

router.put(
  '/update/:postId',
  verifyToken,
  upload.array('collections', 10),
  ValidateJoi(validateSchema.nhadat.update),
  nhadatController.update
);

router.delete('/delete/:postId', verifyToken, nhadatController.delete);

// admin route

router.get(
  '/admin/list/:demand',
  verifyTokenAdmin,
  nhadatController.getAllNhaDat
);

router.get(
  '/admin/detail/:slug',
  verifyTokenAdmin,
  nhadatController.getDetailNhadatByAdmin
);

router.put(
  '/update-status/:postId',
  ValidateJoi(validateSchema.nhadat.updateStatus),
  verifyTokenAdmin,
  nhadatController.updateStatus
);

export default router;
