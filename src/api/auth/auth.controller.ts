import { Response, Request, NextFunction } from 'express';
import User from '../users/users.model';
import bcrypt from 'bcryptjs';

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
    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return response.status(400).json({
        ok: false,
        msg: 'Password invalid!',
      });
    }

    // TODO: Generate JWT

    return response.status(200).json({
      ok: true,
      uid: user._id,
      name: `${user.firstName} ${user.lastName}`,
    });

  } catch (error) {
    next(error);
  }
}