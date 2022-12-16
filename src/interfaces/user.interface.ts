export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  role: 'admin' | 'regular';
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}
