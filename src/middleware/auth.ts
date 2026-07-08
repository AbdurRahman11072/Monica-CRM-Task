import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "../models/user";
import { AuthRequest } from "../types";

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Authorization token required" });
      return;
    }

    const secret =
      process.env.JWT_SECRET || "super_secret_key_change_me_in_production";

    const decoded = jwt.verify(token, secret) as unknown as { id: string };
    const user = await findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ message: "User not found or disabled" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired authorization token" });
  }
};
