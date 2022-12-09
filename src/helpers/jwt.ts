import jwt from 'jsonwebtoken';

export function generateToken(uid: string, name: string): Promise<string | undefined> {
  return new Promise(function (resolve, reject) {
    const payload = { uid, name };
    if (process.env.SECRET_JWT_SEED) {
      jwt.sign(payload, process.env.SECRET_JWT_SEED, {
        expiresIn: '24h',
      }, function (error, token) {
        console.log(error);
        if (error) {
          reject("Couldn't Generate Token");
        }
        resolve(token);
      });
    }
  });
}
