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
}, {
  timestamps: true,
  versionKey: false,
  collection: 'heroes',
});

export default model<HeroInterface>('Hero', HeroSchema);
