import request from 'supertest';
import mongoose from 'mongoose';
import Hero from '../heroes.model';

import app from '../../../app';
import { heroesList } from './heroes.fixtures';


let spidermanId = '';
let ironmanId = '';

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
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
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    await request(app)
      .get(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
      });
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    await request(app)
      .get(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body.errors[0].msg).toBe(`Hero with "${id}" does not exist!`);
      });
  });
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
          ...heroesList[0],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });
});

describe('POST /api/v1/heroes', () => {
  test('Responds with status 400 if hero name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send({
        realName: 'Peter Parker',
        studio: 'Marvel',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Hero name is required!');
  });
  test('Responds with status 400 if hero name is already exist', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send({
        heroName: 'Spiderman',
        realName: 'Peter Parker',
        studio: 'Marvel',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg)
      .toBe('Hero "Spiderman" already exists!');
  });
  test('Responds with status 400 if hero real name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send({
        heroName: 'Flash',
        studio: 'DC',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Hero real name is required!');
  });
  test('Responds with status 400 if studio is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Studio is required!');
  });
  test('Responds with response 201', async () => {
    const newHero = {
      heroName: 'Scarlet Witch',
      realName: 'Wanda Maximoff',
      studio: 'Marvel',
    };
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .send(newHero)
      .expect('Content-Type', /application\/json/)
      .expect(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.hero).toEqual({
      _id: expect.any(String),
      ...newHero,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe('PATCH /api/v1/heroes/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .patch(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    await request(app)
      .patch(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .send({
        heroName: 'Ironman Updated',
        realName: 'Tony Stark Updated',
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body.errors[0].msg).toBe(`Hero with "${id}" does not exist!`);
      });
  });
  test('Responds with status 400 if user send empty body', async () => {
    const response = await request(app)
      .patch('/api/v1/heroes/' + ironmanId)
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Body cannot be empty!');
  });
  test('Responds with response 200', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .send({
        heroName: 'Ironman Updated',
        realName: 'Tony Stark Updated',
      })
      .expect('Content-Type', /application\/json/)
      .expect(200);
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

describe('DELETE /api/v1/heroes/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    await request(app)
      .delete(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body.ok).toBe(false);
        expect(response.body.message).toBe(`ID: "${id}" is not a valid MongoID`);
      });
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    await request(app)
      .delete(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then(response => {
        expect(response.body.ok).toBe(false);
        expect(response.body.message).toBe(`Hero with "${id}" does not exist!`);
      });
  });
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