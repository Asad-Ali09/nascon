import * as express from "express-serve-static-core";
import { User } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
