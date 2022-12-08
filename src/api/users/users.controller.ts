import { Response, Request, NextFunction } from 'express';
import User from './users.model';

export async function usersList(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { limit = 10, skip = 0, orderBy = '_id', sort = 'asc' } = request.query;
    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.find()
        .limit(Number(limit))
        .skip(Number(skip))
        .sort({ [orderBy as string]: (sort === 'asc') ? 1 : (sort === 'desc') ? -1 : 1 }),
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

export async function userProfile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;
    const user = await User.findOne({ _id: id });

    return response.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const user = await User.create(request.body);
    return response.status(201).json({
      ok: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
