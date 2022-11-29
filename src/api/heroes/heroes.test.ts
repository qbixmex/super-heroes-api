import request from 'supertest';
import mongoose from 'mongoose';
import Hero from './heroes.model';

import app from '../../app';
import { HeroInterface } from '../../interfaces';

const heroesList: HeroInterface[] = [
  {
    heroName: 'Spiderman',
    realName: 'Peter Parker',
    studio: 'Marvel',
  },
  {
    heroName: 'Ironman',
    realName: 'Tony Stark',
    studio: 'Marvel',
  },
];

let spidermanId = '';
let ironmanId = '';

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    await Hero.deleteMany({});
    const spiderman = await Hero.create(heroesList[0]);
    const ironman = await Hero.create(heroesList[1]);
    spidermanId = `${spiderman._id}`;
    ironmanId = `${ironman._id}`;
  } catch (error) {
    console.log(error);
  }
});

describe('GET /api/v1/heroes', () => {
  test('Responds with a empty heroes array', async () => {
    await request(app)
      .get('/api/v1/heroes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(response => {
        expect(response.body.ok).toBe(true);
        expect(response.body.heroes).toBeTruthy();
        expect(response.body.heroes.length).toBe(heroesList.length);
      });
  });
});

describe('GET /api/v1/heroes/:id', () => {
  test('Responds with a single hero object', async () => {
    await request(app)
      .get(`/api/v1/heroes/${spidermanId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.ok).toBe(true);
        expect(response.body.hero).toEqual({
          _id: spidermanId,
          heroName: heroesList[0].heroName,
          realName: heroesList[0].realName,
          studio: heroesList[0].studio,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });
});

describe('POST /api/v1/heroes', () => {
  test('Responds with response 201', async () => {
    await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send({
        heroName: 'Spiderman',
        realName: 'Peter Parker',
        studio: 'Marvel',
      })
      .expect('Content-Type', /application\/json/)
      .expect(201)
      .then(response => {
        expect(response.body.hero).toHaveProperty('_id');
      });
  });
});

describe('PATCH /api/v1/heroes/:id', () => {
  test('Responds with response 200', async () => {
    await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .send({
        heroName: 'Ironman Updated',
        realName: 'Tony Stark Updated',
      })
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(response => {
        expect(response.body.ok).toBe(true);
        expect(response.body.hero).toEqual({
          _id: ironmanId,
          heroName: 'Ironman Updated',
          realName: 'Tony Stark Updated',
          studio: heroesList[0].studio,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });
});

describe('DELETE /api/v1/heroes/:id', () => {
  test('Responds with response 200 after hero deleted', async () => {
    await request(app)
      .delete(`/api/v1/heroes/${spidermanId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(response => {
        expect(response.body.ok).toBe(true);
      });
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});