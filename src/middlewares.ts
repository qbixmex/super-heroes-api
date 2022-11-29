import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from './interfaces';

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
  next();
}

