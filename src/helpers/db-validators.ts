import { Request } from 'express-validator/src/base';
import Hero from '../api/heroes/heroes.model';

export async function isHeroExistById(id: string) {
  const heroExist = await Hero.findOne({ _id: id });
  if (!heroExist) throw new Error(`Hero with "${id}" does not exist!`);
  return true;
}

export async function isHeroExist(fieldName: string) {
  const heroExist = await Hero.findOne({ heroName: fieldName });
  if (heroExist) throw new Error(`Hero "${fieldName}" already exists!`);
  return true;
}

export function isEmptyBody(request: Request) {
  if (Object.keys(request.body).length === 0) {
    throw new Error('Body cannot be empty!');
  }
  return true;
}