import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { ErrorResponse, RequestValidators } from './interfaces';

export function notFount(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  response.status(404);
  const error = new Error('🔍 - Not Found - ' + request.originalUrl);
  next(error);
}

export function errorHandler(
  error: Error,
  request: Request,
  response: Response<ErrorResponse>,
  next: NextFunction,
) {
  const statusCode = response.statusCode !== 200 ? response.statusCode : 500;
  response.status(statusCode);
  response.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
  });
  next(); // TODO CHECK IF THIS DOES NOT THROWN AN ERROR!
}

export function validateRequest(validators: RequestValidators) {
  return async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      if (validators.params) {
        request.params = await validators.params.parseAsync(request.params);
      }
      if (validators.body) {
        request.body = await validators.body.parseAsync(request.body);
      }
      if (validators.query) {
        request.query = await validators.query.parseAsync(request.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) response.status(422);
      next(error);
    }
  };
}
