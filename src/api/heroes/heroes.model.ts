import { Schema, model } from 'mongoose';
import { IHero } from '../../interfaces/hero.interface';

const HeroSchema = new Schema<IHero>({
  heroName: {
    type: String,
    required: [true, 'Hero Name is Required!'],
  },
  realName: {
    type: String,
    required: [true, 'Real Name is Required!'],
  },
  studio: {
    type: String,
    required: [true, 'Studio is Required!'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is Required!'],
  },
  image: {
    type: String,
    required: [true, 'Gender is Required!'],
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is Required!'],
  },
  powers: {
    type: String,
    required: [true, 'Powers is Required!'],
  },
}, {
  timestamps: true,
  versionKey: false,
  collection: 'heroes',
});

export default model<IHero>('Hero', HeroSchema);
