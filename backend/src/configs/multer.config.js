import multer from 'multer';
import path from 'path';

export default multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== '.jpg' &&
      ext !== '.png' &&
      ext !== '.jpeg' &&
      ext !== '.webp'
    ) {
      cb(new Error('Image Invalid!'), false);
    }

    cb(null, true);
  },
});
