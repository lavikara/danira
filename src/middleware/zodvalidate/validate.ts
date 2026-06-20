import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

interface RequestSchemas {
  body?: ZodObject;
  query?: ZodObject;
  params?: ZodObject;
}

export const validate =
  (schemas: RequestSchemas) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (schemas.params) {
      req.params = (await schemas.params.parseAsync(req.params)) as any;
    }
    if (schemas.query) {
      req.query = (await schemas.query.parseAsync(req.query)) as any;
    }
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }
    return next();
  };
