import { Response, Request, NextFunction } from 'express';
import User from '../users/users.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../helpers/jwt';

export async function login(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = request.body;

    const user = await User.findOne({ email });

    if (!user) {
      return response.status(400).json({
        ok: false,
        msg: `User with email: "${email}" does not exist!`,
      });
    }

    // Check Matched Passwords
    const validPassword = bcrypt.compareSync(password, user.password!);

    if (!validPassword) {
      return response.status(400).json({
        ok: false,
        msg: 'Password invalid!',
      });
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    //* Generate JWT
    const token = await generateToken(String(user._id), fullName, '24h');

    return response.status(200).json({
      ok: true,
      uid: user._id,
      name: `${user.firstName} ${user.lastName}`,
      token,
    });

  } catch (error) {
    next(error);
  }
}

export async function renewToken(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { uid, name } = request;

    //* Generate JWT
    const token = await generateToken(uid, name);

    return response.status(200).json({
      ok: true,
      name,
      uid,
      token,
    });
  } catch (error) {
    next(error);
  }
}