import jwt from 'jsonwebtoken';

export function generateToken(uid: string, name: string, time: string | number = '1h'): Promise<string> {
  return new Promise(function (resolve, reject) {
    const payload = { uid, name };
    jwt.sign(payload, process.env.SECRET_JWT_SEED!, {
      expiresIn: time,
    }, function (error, token) {
      if (error) reject("Couldn't Generate Token");
      resolve(token!);
    });
  });
}
