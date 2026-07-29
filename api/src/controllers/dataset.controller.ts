import { Request, Response } from "express";
import { uploadDataset } from "../services/uploadService";

export async function upload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded.",
      });
    }

    const dataset = await uploadDataset(req.file);

    return res.status(201).json(dataset);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to upload dataset.",
    });
  }
}
