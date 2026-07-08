import dotenv from "dotenv";
import app from "./app";
import pool from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await pool.query("SELECT NOW()");
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
  }
});
