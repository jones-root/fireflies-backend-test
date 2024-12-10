import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  // For user-targeted specific error messages, the error must be handled in the endpoint or throw an identifiable key to be handled here
  res.status(500).json({
    message:
      "Something went wrong! If the error persists, contact the support for more information.",
  });
};
