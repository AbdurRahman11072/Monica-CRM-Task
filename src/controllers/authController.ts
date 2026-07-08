import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createAccount } from "../models/account";
import { createUser, findUserByEmail } from "../models/user";
import { AuthRequest } from "../types";

const generateToken = (userId: string): string => {
  const secret =
    process.env.JWT_SECRET || "super_secret_key_change_me_in_production";
  return jwt.sign({ id: userId }, secret, { expiresIn: 86400 }); // 24 hours in seconds
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { first_name, last_name, email, password, company_name } = req.body;

    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // Create account
    const account = await createAccount(
      company_name || `${first_name}'s Account`,
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      account_id: account.id,
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken(user.id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id);

    const userResponse = {
      id: user.id,
      account_id: user.account_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
