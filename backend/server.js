import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

import committeeRoutes from "./src/routes/committeeRoutes.js";
import memberRoutes from "./src/routes/memberRoutes.js";
import skippedDateRoutes from "./src/routes/skippedDateRoutes.js";

dotenv.config();

const app = express();

// Only allow the frontend's dev origin (or whatever CLIENT_ORIGIN is set to)
// to call this API from the browser.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json()); // parses JSON request bodies into req.body

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Committee Tracker API" });
});

app.use("/api/committees", committeeRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/skipped-dates", skippedDateRoutes);

// Must come after all routes: catches unmatched routes, then formats errors.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
