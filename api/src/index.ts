import dotenv from "dotenv";
import cors from "cors";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-vercel-app.vercel.app",
    ],
    credentials: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server running on PORT :${PORT}`);
});