import { Request, Response } from "express";

export function notFound(_: Request, res: Response) {
  res.status(404).json({ message: "Route doesn't exist" });
}

export default notFound;
