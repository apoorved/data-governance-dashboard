import { Request, Response } from "express";
import { uploadDataset } from "../services/uploadService";
import { findAll, findById } from "../services/datasetService";
import { serializeBigInt } from "../utils/helper";

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

export async function getDatasets(_req: Request, res: Response) {
  try {
    const datasets = await findAll();

    return res.status(201).json(serializeBigInt(datasets));
  } catch (error) {
    console.log(process.env.DATABASE_URL, "yy");
    console.log("Errz", error);
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve datasets.",
    });
  }
}

export async function getDatasetByID( req: Request<{ id: string }>, res: Response) {
   try {
    const { id } = req.params;
    const datasets = await findById(BigInt(id));

    return res.status(201).json(serializeBigInt(datasets));
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to retrieve dataset.",
    });
  }
}