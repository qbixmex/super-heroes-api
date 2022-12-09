import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../interfaces/jwt.interface';

export function validateJWT(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = request.header('x-token');

  if (!token) {
    return response.status(401).json({
      ok: false,
      msg: "There's not token by the request",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.SECRET_JWT_SEED!,
    ) as JWTPayload;

    request.uid = payload.uid;
    request.name = payload.name;

  } catch (error) {
    return response.status(401).json({
      ok: false,
      msg: 'Token is not valid',
    });
  }

  next();
}
