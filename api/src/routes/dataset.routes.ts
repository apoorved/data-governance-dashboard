import { Router } from "express";
import { upload } from "../controllers/dataset.controller";
import { uploadFile } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", uploadFile.single("file"), upload);

export default router;