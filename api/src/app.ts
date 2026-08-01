import express from "express";
import datasetRoutes from "./routes/dataset.routes";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-vercel-app.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/datasets", datasetRoutes);

export default app;