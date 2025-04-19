import { Request, Response } from "express";
import customError from "../utils/customError";
import { UserModel } from "../models/user.model";
import { cookieOptions } from "../utils/auth.utils";
import { TokenType } from "../types/authTypes";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config";

const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!email || !password)
    throw new customError(400, "Invalid email or password");

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new customError(400, "User already exists");
  }

  let newUser = new UserModel({
    name,
    email,
    password,
    role,
  });

  await newUser.save();

  const token = newUser.createJWT();

  res.cookie("token", token, cookieOptions(new Date(Date.now() + 1000 * 600)));

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(201).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(201).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = user.createJWT();

  res.cookie("token", token, cookieOptions());

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const isLoggedIn = async (req: Request, res: Response) => {
  const { token } = req.cookies;

  if (!token || typeof token !== "string") {
    return res.status(200).json({ user: null, isLoggedIn: false });
  }

  const decodedToken = (await jwt.verify(token, jwtConfig.secret)) as TokenType;
  if (!decodedToken) {
    return res.status(200).json({ user: null, isLoggedIn: false });
  }
  const user = await UserModel.findById(decodedToken.userID);
  if (!user) return res.status(200).json({ user: null, isLoggedIn: false });
  const { password, ...responseUser } = user.toObject();
  return res.status(200).json({ user: responseUser, isLoggedIn: true });
};

const logout = async (_: Request, res: Response) => {
  res.clearCookie("token", cookieOptions());
  res.status(200).json({ message: "Logged Out Successfully" });
};

export { signup, login, isLoggedIn, logout };
