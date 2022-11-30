import Hero from '../api/heroes/heroes.model';

export async function isHeroExist(fieldName: string) {
  const heroExist = await Hero.findOne({ heroName: fieldName });
  if (heroExist) throw new Error(`Hero "${fieldName}" already exists!`);
}
