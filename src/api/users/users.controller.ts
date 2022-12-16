import { Response, Request, NextFunction } from 'express';
import User from './users.model';
import { encryptPassword } from '../../helpers/encryptPassword';
import { IUser } from '../../interfaces/user.interface';

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
        .sort({ [orderBy as string]: (sort === 'asc') ? 1 : (sort === 'desc') ? -1 : 1 })
        .select('-password'),
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
    const user = await User.findOne({ _id: id }).select('-password');

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

    delete user.password;

    return response.status(201).json({
      ok: true,
      user: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
    const { firstName, lastName, email, image, role, password } = request.body;

    const userForUpdate: IUser = {
      firstName,
      lastName,
      email,
      image,
      role,
    };

    if (password) {
      userForUpdate.password = encryptPassword(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      userForUpdate,
      { new: true },
    ).select('-password');

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
