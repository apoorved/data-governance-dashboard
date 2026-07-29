import express from "express";
import datasetRoutes from "./routes/dataset.routes";

const app = express();

app.use(express.json());

app.use("/datasets", datasetRoutes);

export default app;