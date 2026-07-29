import { Router } from "express";
import { upload, getDatasets, getDatasetByID } from "../controllers/dataset.controller";
import { uploadFile } from "../middleware/upload.middleware";

const router = Router();

router.post("/upload", uploadFile.single("file"), upload);
router.get("/", getDatasets)
router.get("/:id", getDatasetByID);


export default router;