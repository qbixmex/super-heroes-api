import { Schema, model } from 'mongoose';

const HeroSchema = new Schema({
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

export default model('Hero', HeroSchema);
