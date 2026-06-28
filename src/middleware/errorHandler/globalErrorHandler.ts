import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/client.js';
import { ZodError } from 'zod';
import { ApiError } from '../../utils/apiResponse.js';
import { ApiResponse } from '../../types/definitions.js';

export const globalErrorHandler = (
  err:
    | Error
    | ApiError
    | ZodError
    | Prisma.PrismaClientKnownRequestError
    | Prisma.PrismaClientValidationError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    message = process.env.NODE_ENV === 'development' ? err.message : 'Database request error';
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = process.env.NODE_ENV === 'development' ? err.message : 'Database request error';
  } else if (err instanceof ZodError) {
    statusCode = 400;
    const issues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    message = process.env.NODE_ENV === 'development' ? JSON.stringify(issues) : 'Invalid input';
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const errorResponse: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};
