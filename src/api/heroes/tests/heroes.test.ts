import path from 'path';
import fs from 'fs';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../users/users.model';
import Hero from '../heroes.model';

import app from '../../../app';
import { heroesList } from './heroes.fixtures';
import { generateToken } from '../../../helpers/jwt';
import { encryptPassword } from '../../../helpers/encryptPassword';
import { usersList } from '../../users/tests/users.fixtures';

let fullName: string;
let token: string;
let spidermanId: string;
let ironmanId: string;
const imagePath = path.join(__dirname, '/assets/', 'image-placeholder.jpg');
const heroesImagesPath = path.join(__dirname, '../../../uploads/heroes');

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
    await User.deleteMany({});
    await Hero.deleteMany({});

    //* Generate JWT
    const encryptedPassword = encryptPassword(usersList[0].password!);
    await User.create({ ...usersList[0], password: encryptedPassword });

    const user = await User.findOne({ email: 'stanlee@marvel.com' });

    fullName = `${user?.firstName} ${user?.lastName}`;

    //* Generate JWT
    token = await generateToken(String(user?._id), fullName, 60);

    //* Create Heroes
    for (let i = 0; i < heroesList.length; i++) {
      await Hero.create(heroesList[i]);
    }    

    const spiderman = await Hero.findOne({ heroName: 'Spiderman' }).select('_id');
    const ironman = await Hero.findOne({ heroName: 'Ironman' }).select('_id');

    spidermanId = String(spiderman?._id);
    ironmanId = String(ironman?._id);

  } catch (error) {
    console.log(error);
  }
});

describe('GET /api/v1/heroes', () => {  
  test('Responds with status 200 with expected list length', async () => {
    const response = await request(app)
      .get('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes.length).toBe(heroesList.length);
    expect(response.body.total).toBeTruthy();
  });
  test('Show a limited list with provided query param', async () => {
    const limit = 4;
    const response = await request(app)
      .get(`/api/v1/heroes?limit=${limit}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes.length).toBe(limit);
  });
  test('Sort heroes list by hero name ascending without sort query param', async () => {
    const response = await request(app)
      .get('/api/v1/heroes?orderBy=heroName')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes[0].heroName).toBe('Batman');
  });
  test('Sort heroes list by hero name ascending', async () => {
    const response = await request(app)
      .get('/api/v1/heroes?orderBy=heroName&sort=asc')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes[0].heroName).toBe('Batman');
  });
  test('Sort heroes list by hero name descending', async () => {
    const response = await request(app)
      .get('/api/v1/heroes?orderBy=heroName&sort=desc')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes[0].heroName).toBe('Wonder Woman');
  });
  test('Skip heroes list with quantity number by query param', async () => {
    const response = await request(app)
      .get('/api/v1/heroes?skip=2')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.heroes[0].heroName).toBe('Captain America');
  });
});

describe('GET /api/v1/heroes/:id', () => {  
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .get(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    const response = await request(app)
      .get(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe(`Hero with "${id}" does not exist!`);
  });
  test('Responds with a single hero object', async () => {
    const response = await request(app)
      .get(`/api/v1/heroes/${spidermanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.hero).toEqual({
      _id: spidermanId,
      ...heroesList[0],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe.only('POST /api/v1/heroes', () => {
  test('Responds with status 400 if body is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Body cannot be empty!');
  });
  test('Responds with status 400 if hero name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        realName: 'Peter Parker',
        studio: 'Marvel',
        gender: 'Male',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Hero name is required!');
  });
  test('Responds with status 400 if hero name is already exist', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Ironman',
        realName: 'Peter Parker',
        studio: 'Marvel',
        gender: 'Male',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg)
      .toBe('Hero "Ironman" already exists!');
  });
  test('Responds with status 400 if hero real name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
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
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Studio is required!');
  });
  test('Responds with status 400 if gender is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        nationality: 'American',
        powers: 'Strength, Smash',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Gender is required!');
  });
  test('Responds with status 400 if nationality is not a string', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        gender: 'Male',
        nationality: 123,
        powers: 'Strength, Smash',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Nationality must be a string!');
  });
  test('Responds with status 400 if powers is not a string', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        gender: 'Male',
        image: 'https://domain.com/image.jpg',
        nationality: 'American',
        powers: false,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Powers must be a string!');
  });
  test('Responds with status 400 if image is empty', async () => {
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        gender: 'Male',
        nationality: 'American',
        powers: 'Smash, Strength',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body).toEqual({
      ok: false,
      msg: 'No image was provided!',
    });
  });
  test('Responds with response 201', async () => {
    const newHero = {
      heroName: 'Scarlet Witch',
      realName: 'Wanda Maximoff',
      studio: 'Marvel',
      gender: 'Female',
      nationality: 'Sokovia',
      powers: 'Telekinesis, Energy manipulation, Neuroelectric Interfacing',
    };
    const response = await request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .attach('image', imagePath)
      .field(newHero)
      .expect('Content-Type', /application\/json/)
      .expect(201);

    console.log(response.body);

    expect(response.body).toEqual({
      ok: true,
      hero: {
        _id: expect.any(String),
        ...newHero,
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });

    //* Clear Image Placeholder
    if (fs.existsSync(heroesImagesPath)) {
      fs.unlinkSync(`${heroesImagesPath}/${response.body.hero.image}`);
    }
  });
});

describe('PATCH /api/v1/heroes/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .patch(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    await request(app)
      .patch(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
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
  test('Responds with status 400 if hero name is already exist', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        ...heroesList[1],
        heroName: 'Spiderman',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg)
      .toBe('Hero "Spiderman" already exists!');
  });
  test('Responds with status 400 if user send empty body', async () => {
    const response = await request(app)
      .patch('/api/v1/heroes/' + ironmanId)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({})
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Body cannot be empty!');
  });
  test('Responds with status 400 if gender is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        ...heroesList[1],
        gender: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Gender cannot be empty!');
  });
  test('Responds with status 400 if image is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        ...heroesList[1],
        image: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Image cannot be empty!');
  });
  test('Responds with status 400 if nationality is not a string', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        gender: 'Male',
        image: 'https://domain.com/image.jpg',
        nationality: 123,
        powers: 'Strength, Smash',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Nationality must be a string!');
  });
  test('Responds with status 400 if powers is not a string', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        heroName: 'Hulk',
        realName: 'Steve Banner',
        studio: 'Marvel',
        gender: 'Male',
        image: 'https://domain.com/image.jpg',
        nationality: 'American',
        powers: false,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Powers must be a string!');
  });
  test('Responds with response 200', async () => {
    const response = await request(app)
      .patch(`/api/v1/heroes/${ironmanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .send({
        ...heroesList[1],
        image: 'https://domain.com/updated-image.jpg',
      })
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.hero).toEqual({
      _id: ironmanId,
      ...heroesList[1],
      image: 'https://domain.com/updated-image.jpg',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe('DELETE /api/v1/heroes/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .delete(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    const response = await request(app)
      .delete(`/api/v1/heroes/${id}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe(`Hero with \"${id}\" does not exist!`);
  });
  test('Responds with response 200 after hero deleted', async () => {
    const response = await request(app)
      .delete(`/api/v1/heroes/${spidermanId}`)
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});
