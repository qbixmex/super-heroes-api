import { Schema, model } from 'mongoose';
import { HeroInterface } from '../../interfaces/hero.interface';

const HeroSchema = new Schema<HeroInterface>({
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
  nationality: String,
  powers: String,
}, {
  timestamps: true,
  versionKey: false,
  collection: 'heroes',
});

export default model<HeroInterface>('Hero', HeroSchema);
