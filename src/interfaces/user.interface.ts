export interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  role: 'admin' | 'regular';
  password: string;
}
