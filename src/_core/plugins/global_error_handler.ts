import { NextFunction, Request, Response } from "express";
import httpErrors from "http-errors";

const defaultMessagePerError = {
  [httpErrors.NotFound.name]: new httpErrors.NotFound().message,
  [httpErrors.BadRequest.name]: new httpErrors.BadRequest().message,
  [httpErrors.Unauthorized.name]: new httpErrors.Unauthorized().message,
  [httpErrors.Forbidden.name]: new httpErrors.Forbidden().message,
};

// For user-targeted specific error messages, the error must be handled in the endpoint or throw an identifiable key to be handled here
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  const defaultMessage = defaultMessagePerError[error.name];
  const hasCustomMessage = defaultMessage && defaultMessage !== error.message;

  if (error instanceof httpErrors.NotFound) {
    res.status(error.status).json({
      message: hasCustomMessage ? error.message : "Not found.",
    });
    return;
  } else if (error instanceof httpErrors.Unauthorized) {
    res.status(error.status).json({
      message: hasCustomMessage ? error.message : "Authentication required.",
    });
    return;
  } else if (error instanceof httpErrors.Forbidden) {
    res.status(error.status).json({
      message: hasCustomMessage
        ? error.message
        : "No permission to access resource.",
    });
    return;
  } else if (error instanceof httpErrors.BadRequest) {
    res.status(error.status).json({
      message: hasCustomMessage
        ? error.message
        : "One or more of the provided values are invalid.",
    });
    return;
  }

  res.status(500).json({
    message: hasCustomMessage
      ? error.message
      : "Something went wrong! If the error persists, contact the support for more information.",
  });
};
