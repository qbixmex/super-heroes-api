import bcrypt from 'bcryptjs';

export function encryptPassword(password: string, rounds: number = 1): string {
  const salt = bcrypt.genSaltSync(rounds);
  const encryptedPassword = bcrypt.hashSync(password, salt);
  return encryptedPassword;
}
