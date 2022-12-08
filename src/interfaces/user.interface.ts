export interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'regular';
  password: string;
}
