import { Response, Request, NextFunction } from 'express';

export async function heroes(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    return response.status(200).json({
      heroes: [],
    });
  } catch (error) {
    next(error);
  }
}