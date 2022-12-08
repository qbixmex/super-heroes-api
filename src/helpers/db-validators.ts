import { Request } from 'express-validator/src/base';
import Hero from '../api/heroes/heroes.model';
import User from '../api/users/users.model';

export async function isHeroExistById(id: string) {
  const heroExist = await Hero.findOne({ _id: id });
  if (!heroExist) throw new Error(`Hero with "${id}" does not exist!`);
  return true;
}

export async function isHeroExist(fieldName: string, currentHeroId?: string) {
  const heroExist = await Hero.findOne({ heroName: fieldName });
  const errorMessage = `Hero "${fieldName}" already exists!`;  
  if (heroExist) {
    if (currentHeroId && currentHeroId === String(heroExist?._id)) {
      return true;
    } else {
      throw new Error(errorMessage);
    }
  }
  return true;
}

export function isEmptyBody(request: Request) {
  if (Object.keys(request.body).length === 0) {
    throw new Error('Body cannot be empty!');
  }
  return true;
}

export async function isUserExistById(id: string) {
  const userExist = await User.findOne({ _id: id });
  if (!userExist) throw new Error(`User with id: "${id}" does not exist!`);
  return true;
}

export async function isValidRole(role?: string) {
  if (role) {
    const acceptedRoles = ['admin', 'regular'];
    if (!acceptedRoles.includes(role)) {
      throw new Error(`Role: "${role}" is invalid!`);
    }
  }
  return true;
}

export async function isEmailExist(email: string, currentUserId?: string) {
  const user = await User.findOne({ email: email });
  const errorMessage = `Email: "${email}" already exists!`;

  if (user) {
    if (currentUserId && currentUserId === String(user?._id)) {
      return true;
    } else {
      throw new Error(errorMessage);
    }
  }
  return true;
}
