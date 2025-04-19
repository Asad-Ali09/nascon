import { NextFunction, Request, Response } from "express";
import customError from "../utils/customError";

const errorHandler = async (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = err.message || "Internal Server Error";
  if (err instanceof customError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  return res.status(statusCode).json({ message });
};

export default errorHandler;
