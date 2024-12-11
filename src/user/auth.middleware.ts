import { Request, Response, NextFunction } from "express";
import httpErrors from "http-errors";

export interface AuthenticatedRequest<
	Params extends Record<string, any> = any,
	Query extends Record<string, any> = any,
	Body extends Record<string, any> = any,
> extends Request {
	userId?: string;
	params: Params;
	body: Body;
	parsedQuery?: Query;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	const userId = req.header("x-user-id");
	if (!userId) {
		throw new httpErrors.Unauthorized();
	}
	req.userId = userId;
	next();
};
