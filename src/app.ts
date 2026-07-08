import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

// Base route for health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export default app;
