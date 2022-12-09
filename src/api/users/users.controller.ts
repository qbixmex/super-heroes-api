import { Response, Request, NextFunction } from 'express';
import User from './users.model';
import { encryptPassword } from '../../helpers/encryptPassword';
import { generateToken } from '../../helpers/jwt';

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
    const body = request.body;

    //* Encrypt Password
    const encryptedPassword = encryptPassword(request.body.password, 10);

    const user = await User.create({ ...body, password: encryptedPassword });

    const fullName = `${user.firstName} ${user.lastName}`;

    //* Generate JWT
    const token = await generateToken(String(user._id), fullName);

    return response.status(201).json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      request.body,
      { new: true },
    );

    return response.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const id = request.params.id;

    await User.findOneAndDelete({ _id: id });

    return response.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}
