import { NextFunction, Request, Response } from "express";
import mongoose, { ClientSession } from "mongoose";

const withTransaction = (
  controller: (
    req: Request,
    res: Response,
    session: ClientSession
  ) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await controller(req, res, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  };
};

export default withTransaction;
