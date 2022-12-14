import { Schema, model } from 'mongoose';
import { IUser } from '../../interfaces';

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [ true, 'First Name is Required !'],
  },
  lastName: {
    type: String,
    required: [ true, 'Last Name is Required !'],
  },
  email: {
    type: String,
    required: [ true, 'Email is Required !'],
  },
  image: {
    type: String,
    required: [ true, 'Image is Required !'],
  },
  role: {
    type: String,
    default: 'regular',
  },
  password: {
    type: String,
    required: [ true, 'Password is Required !'],
  },
}, {
  timestamps: true,
  versionKey: false,
  collection: 'users',
});

export default model<IUser>('User', UserSchema);
