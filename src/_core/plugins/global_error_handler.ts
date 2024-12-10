import { NextFunction, Request, Response } from "express";
import httpErrors from "http-errors";

// For user-targeted specific error messages, the error must be handled in the endpoint or throw an identifiable key to be handled here
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof httpErrors.NotFound) {
    res.status(err.status).json({ message: "Not found." });
    return;
  }

  res.status(500).json({
    message:
      "Something went wrong! If the error persists, contact the support for more information.",
  });
};
