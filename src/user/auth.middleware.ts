import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest<
  Params extends Record<string, any> = any,
  Query extends Record<string, any> = any,
  Body extends Record<string, any> = any,
> extends Request {
  userId?: string;
  params: Params;
  query: Query;
  body: Body;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.header("x-user-id");
  if (!userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  req.userId = userId;
  next();
};
