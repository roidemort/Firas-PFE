import multer from 'multer';
import { CustomError } from "@/utils/response/custom-error/CustomError"

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new CustomError(415, 'Unsupported', 'Unsupported Media Type'));
    }
    cb(undefined, true);
  },
});

export default upload;
