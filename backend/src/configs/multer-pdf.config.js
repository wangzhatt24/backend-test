import multer from 'multer';
import path from 'path';

export default multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== '.pdf') {
      cb(new Error('File PDF không hợp lệ'), false);
    }

    cb(null, true);
  },
});
