import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contacts";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

// Base route for health check
app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export default app;
