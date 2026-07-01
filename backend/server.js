import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { notFound, errorHandler } from "./src/middleware/errorHandler.js";
import committeeRoutes from "./src/routes/committeeRoutes.js";
import memberRoutes from "./src/routes/memberRoutes.js";
import skippedDateRoutes from "./src/routes/skippedDateRoutes.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "https://commitee-tracker-mern.vercel.app/" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Committee Tracker API" });
});

app.use("/api/committees", committeeRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/skipped-dates", skippedDateRoutes);

app.use(notFound);
app.use(errorHandler);

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database Connected Successfully!");
  } catch (error) {
    console.log("Something went wrong while connecting DB:", error.message);
  }
};
await connectDb();

const PORT = process.env.PORT || 5000;

// Vercel sets this env var automatically - so app.listen() only runs locally,
// never during serverless deployment.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;