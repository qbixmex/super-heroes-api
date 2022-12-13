import { Response, Request, NextFunction } from 'express';

export function validateFile(
  request: Request,
  response: Response,
  next: NextFunction) {
  if (
    !request.files ||
    Object.keys(request.files).length === 0 ||
    !request.files?.image
  ) {
    return response.status(400).json({
      ok: false,
      msg: 'No image was provided!',
    });
  }
  next();
}
