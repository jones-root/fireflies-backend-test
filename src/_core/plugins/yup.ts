import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import Yup from "yup";
import { AuthenticatedRequest } from "../../user/auth.middleware";

export interface IEndpointSchema {
  body?: Yup.Schema;
  query?: Yup.Schema;
  params?: Yup.Schema;
}

const options: Yup.ValidateOptions<any> = {
  strict: true,
  abortEarly: true,
  stripUnknown: true,
  recursive: true,
};

export function validate({ params, query, body }: IEndpointSchema) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (req.query.json && typeof req.query.json === "string") {
        req.parsedQuery = JSON.parse(req.query.json);
      }

      req.params = (await params?.validate(req.params, options)) ?? req.params;
      req.parsedQuery =
        (await query?.validate(req.parsedQuery ?? req.query, options)) ??
        req.query;
      req.body = (await body?.validate(req.body, options)) ?? req.body;
      next();
    } catch (error: any) {
      res.status(400).json({ type: error.name, message: error.message });
    }
  };
}

export const yupMongoId = Yup.object({
  id: Yup.string()
    .required()
    .test({
      message: "invalid id",
      test: (value) => mongoose.Types.ObjectId.isValid(value),
    }),
});
export type IYupMongoId = Yup.InferType<typeof yupMongoId>;
