import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import customError from "../utils/customError";
import { UserModel } from "../models/user.model";
import { TokenType } from "../types/authTypes";

const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  // Get the token from the cookies
  const token = req.cookies.token as string;
  if (!token) {
    throw new customError(401, "Unauthenticated. Please Login");
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenType;
  const user = await UserModel.findById(decoded.userID).select("-password");
  if (!user) {
    throw new customError(401, "Unauthenticated. Please Login");
  }
  req.user = user;
  next();
};

const roleMiddleware = (role: string) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      throw new customError(401, "Unauthenticated. Please Login");
    }

    // Check if the user has the required role
    if (!role.includes(user.role)) {
      throw new customError(
        403,
        "Unauthorized. You do not have access to this resource"
      );
    }

    next();
  };
};

export { roleMiddleware };

export default authMiddleware;
