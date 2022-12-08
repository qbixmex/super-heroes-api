import request from 'supertest';
import mongoose from 'mongoose';
import User from '../users.model';

import app from '../../../app';
import { usersList } from './users.fixtures';

let stanLeeId = '';
let jackKirbyId = '';

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
    await User.deleteMany({});
    for (let i = 0; i < usersList.length; i++) {
      await User.create(usersList[i]);
    }
    const stanLee = await User.findOne({ email: 'stanlee@marvel.com' });
    const johnDoe = await User.findOne({ email: 'jhon-doe@nodomain.com' });

    stanLeeId = String(stanLee?._id);
    jackKirbyId = String(johnDoe?._id);
  } catch (error) {
    console.log(error);
  }
});

describe('GET /api/v1/users', () => {
  test('Responds with status 200 with expected users list length', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users.length).toBe(usersList.length);
    expect(response.body.total).toBe(usersList.length);
  });
  test('Show a limited list with provided query param', async () => {
    const limit = 1;
    const response = await request(app)
      .get(`/api/v1/users?limit=${limit}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users.length).toBe(limit);
  });
  test('Sort users list by email ascending', async () => {
    const response = await request(app)
      .get('/api/v1/users?orderBy=email')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users[0].email).toBe('jack-kirby@marvel.com');
  });
  test('Sort users list by email descending', async () => {
    const response = await request(app)
      .get('/api/v1/users?orderBy=email&sort=desc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users[0].email).toBe('stanlee@marvel.com');
  });
  test('Sort users list by First Name ascending', async () => {
    const response = await request(app)
      .get('/api/v1/users?orderBy=firstName')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users[0].firstName).toBe('Jack');
  });
  test('Sort users list by First Name descending', async () => {
    const response = await request(app)
      .get('/api/v1/users?skip=1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users[0].email).toBe('jack-kirby@marvel.com');
  });
  test('Sort users list by First Name descending', async () => {
    const response = await request(app)
      .get('/api/v1/users?orderBy=firstName&sort=desc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.users[0].firstName).toBe('Stan');
  });
});

describe('GET /api/v1/users/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .get(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg)
      .toBe('Provided id is not a valid Mongo ID');
    // console.log(response.body);
  });  
  test('Responds with status code 404 user is not found', async () => {
    const id = '6386c276866dc450ba45a133';
    const response = await request(app)
      .get(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg)
      .toBe(`User with id: "${id}" does not exist!`);
    // console.log(response.body);
  });  
  test('Responds with a single user object', async () => {
    const response = await request(app)
      .get(`/api/v1/users/${stanLeeId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.user).toEqual({
      _id: stanLeeId,
      ...usersList[0],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});