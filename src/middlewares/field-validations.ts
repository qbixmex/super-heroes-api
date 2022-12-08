import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function fieldValidation(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    validationResult(request).throw();
    return next();
  } catch (errors: any) {
    // console.log(errors);
    response.status(400).json({
      ok: false,
      ...errors,
    });
  }
}