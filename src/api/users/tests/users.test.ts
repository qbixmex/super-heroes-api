import request from 'supertest';
import mongoose from 'mongoose';
import User from '../users.model';

import app from '../../../app';
import { usersList } from './users.fixtures';
import { encryptPassword } from '../../../helpers/encryptPassword';

let stanLeeId = '';
let jackKirbyId = '';

beforeEach(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);
    await User.deleteMany({});

    for (let i = 0; i < usersList.length; i++) {
      const encryptedPassword = encryptPassword(usersList[i].password);
      await User.create({ ...usersList[i], password: encryptedPassword });
    }

    const stanLee = await User.findOne({ email: 'stanlee@marvel.com' });
    const jackKirby = await User.findOne({ email: 'jack-kirby@marvel.com' });

    stanLeeId = String(stanLee?._id);
    jackKirbyId = String(jackKirby?._id);
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
  test('Responds with status 400 if email exists!', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: usersList[0].email,
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe(`Email: "${usersList[0].email}" already exists!`);
  });
  test('Responds with status 400 if image url is empty!', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
        role: 'regular',
        password: 'secret-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Image is required!');
  });
  test('Responds with status 400 if role is not a valid role', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send({
        firstName: 'Michael',
        lastName: 'Jackson',
        email: 'michael-jackson@moonwalker.com',
        image: 'michael-jackson.jpg',
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
        image: 'michael-jackson.jpg',
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
        image: 'michael-jackson.jpg',
        role: 'admin',
        password: '123',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long!');
  });
  test('Responds with status 201 if user is created', async () => {
    const newUser = {
      firstName: 'Michael',
      lastName: 'Jackson',
      email: 'michael-jackson@moonwalker.com',
      image: 'michael-jackson.jpg',
      password: 'secret-password',
      role: 'admin',
    };
    const response = await request(app)
      .post('/api/v1/users')
      .set('Accept', 'application/json')
      .send(newUser)
      .expect('Content-Type', /application\/json/)
      .expect(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.user).toEqual({
      _id: expect.any(String),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      image: newUser.image,
      password: expect.any(String),
      role: newUser.role,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe('PATCH /api/v1/users/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .patch(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 if user is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    await request(app)
      .patch(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then(response => {
        expect(response.body.errors[0].msg).toBe(`User with id: "${id}" does not exist!`);
      });
  });
  test('Responds with status 400 if body is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Body cannot be empty!');
  });
  test('Responds with status 400 if first Name is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        firstName: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('First Name cannot be empty!');
  });
  test('Responds with status 400 if first Name is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        lastName: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Last Name cannot be empty!');
  });
  test('Responds with status 400 if first Name is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        email: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Email cannot be empty!');
  });
  test('Responds with status 400 if first Name is empty', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        email: 'jack-kirby-marvel',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Email is not valid!');
  });
  test('Responds with status 400 if email exists!', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        email: usersList[0].email,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe(`Email: "${usersList[0].email}" already exists!`);
  });
  test('Responds with status 400 if image url is empty!', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        image: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Image is required!');
  });
  test('Responds with status 400 if role is not a valid role', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        role: 'vip',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Role: "vip" is invalid!');
  });
  test('Responds with status 400 if password is not a valid min length', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send({
        ...usersList[1],
        password: '123',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.errors[0].msg).toBe('Password must be at least 8 characters long!');
  });
  test('Responds with status 200 if user is updated', async () => {
    const updatedUser = {
      ...usersList[1],
      role: 'regular',
      password: 'another-brick-on-the-wall',
    };

    const response = await request(app)
      .patch(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .send(updatedUser)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.user).toEqual({
      _id: expect.any(String),
      ...updatedUser,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});

describe('DELETE /api/v1/users/:id', () => {
  test('Responds with status code 400 if id is not valid', async () => {
    const id = 123;
    const response = await request(app)
      .delete(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe('Provided id is not a valid Mongo ID');
  });
  test('Responds with status code 404 hero is not found', async () => {
    const id = '6385cbca684dd769f24c045d';
    const response = await request(app)
      .delete(`/api/v1/users/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
    expect(response.body.errors[0].msg).toBe(`User with id: "${id}" does not exist!`);
  });
  test('Responds with status code 200 after user deleted', async () => {
    const response = await request(app)
      .delete(`/api/v1/users/${jackKirbyId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /application\/json/)
      .expect(200);
    expect(response.body.ok).toBe(true);
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});