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

describe('POST /api/v1/users', () => {
  test('Responds with status 400 if body is empty', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Body cannot be empty!');
  });  
  test('Responds with status 400 if First Name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('First Name is required!');
  });  
  test('Responds with status 400 if Last Name is empty', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        email: 'michael-jackson@moonwalker.com',
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Last Name is required!');
  });
  test('Responds with status 400 if Email is empty', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Email is required!');
  });
  test('Responds with status 400 if Email is not valid', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson-moonwalker',
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Email is not valid!');
  });
  test('Responds with status 400 if role is not a valid role', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
        role: 'vip',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Role: "vip" is invalid!');
  });
  test('Responds with status 400 if password is empty', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Password is required!');
  });
  test('Responds with status 400 if password is not a valid min length', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
        role: 'admin',
        password: '123',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long!');
  });
  test('Responds with status 201 if user is created', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({ ...usersList[0] })
      .expect('Content-Type', /application\/json/)
      .expect(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.user).toEqual({
      _id: expect.any(String),
      ...usersList[0],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});