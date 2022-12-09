export interface JWTPayload {
  uid: string;
  name: string;
  iat: number;
  exp: number;
}
