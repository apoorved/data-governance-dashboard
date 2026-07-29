import multer from "multer";
import path from "path";
import { fileSize, allowedExtensions } from "../constants";

export const uploadFile = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: fileSize,
  },

  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only CSV and Excel files are allowed."));
    }

    cb(null, true);
  },
});
