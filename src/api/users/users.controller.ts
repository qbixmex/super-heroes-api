import { Response, Request, NextFunction } from 'express';
import User from './users.model';

export async function usersList(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find(),
    ]);

    return response.status(200).json({
      ok: true,
      users,
      total,
    });
  } catch (error) {
    next(error);
  }
}