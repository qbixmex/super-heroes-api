import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function fieldValidation(
  request: Request,
  response: Response,
  next: NextFunction,
) {

  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json(errors);
  }

  next();

}