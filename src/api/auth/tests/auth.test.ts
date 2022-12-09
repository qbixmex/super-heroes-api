import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../users/users.model';

import app from '../../../app';
import { usersList } from '../../users/tests/users.fixtures';
import { encryptPassword } from '../../../helpers/encryptPassword';
import { generateToken } from '../../../helpers/jwt';

let token: string;
let userId: string;
let fullName: string;

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);

    await User.deleteMany({});

    const encryptedPassword = encryptPassword(usersList[0].password);
    await User.create({ ...usersList[0], password: encryptedPassword });

    const user = await User.findOne({ email: 'stanlee@marvel.com' });

    fullName = `${user?.firstName} ${user?.lastName}`;
    userId = String(user?._id);

    //* Generate JWT
    token = await generateToken(String(user?._id), fullName, 1);

  } catch (error) {
    console.log(error);
  }
});

describe('POST /api/v1/auth', () => {
  test('Responds 400 if email is empty', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: '',
        password: usersList[0].password,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
  });
  test('Responds 400 if email is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: 'stan-lee-marvel',
        password: usersList[0].password,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
  });
  test('Responds 400 if user was not found', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: 'michael-jackson@moonwalker.com',
        password: usersList[0].password,
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body).toEqual({
      ok: false,
      msg: 'User with email: "michael-jackson@moonwalker.com" does not exist!',
    });
  });
  test('Responds 400 if password is empty', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: usersList[0].email,
        password: '',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
  });
  test('Responds 400 if password is not 8 characters length or bigger', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: usersList[0].email,
        password: '123',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);
    expect(response.body.ok).toBe(false);
  });
  test('Responds 400 if password is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/')
      .set('Accept', 'application/json')      
      .send({
        email: usersList[0].email,
        password: 'incorrect-password',
      })
      .expect('Content-Type', /application\/json/)
      .expect(400);

    expect(response.body).toEqual({
      ok: false,
      msg: 'Password invalid!',
    });
  });
  test('Responds 200 ok if is user is authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/auth')
      .set('Accept', 'application/json')
      .send({
        email: usersList[0].email,
        password: usersList[0].password,        
      })
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      uid: expect.any(String),
      name: `${usersList[0].firstName} ${usersList[0].lastName}`,
      token: expect.any(String),
    });
  });
});

describe('GET /api/v1/auth', () => {
  test('Responds 401 if token was not found', async () => {
    const response = await request(app)
      .get('/api/v1/auth/renew')
      .set('Accept', 'application/json')
      .set('x-token', '')
      .expect('Content-Type', /application\/json/)
      .expect(401);

    expect(response.body).toEqual({
      ok: false,
      msg: "There's not token by the request",
    });
  });
  test('Responds 401 if token has been expired or not valid', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MzkzODMxMWY5Njg2NDFiNjI0ZDFkNTIiLCJuYW1lIjoiU3RhbiBMZWUiLCJpYXQiOjE2NzA2MTE3MjksImV4cCI6MTY3MDYxMTczMH0.3EUsq4jGIYip8uxOP00rCtyjLqRBfN6cMh_S1ndQL1k';
    const response = await request(app)
      .get('/api/v1/auth/renew')
      .set('Accept', 'application/json')
      .set('x-token', expiredToken)
      .expect('Content-Type', /application\/json/)
      .expect(401);

    expect(response.body).toEqual({
      ok: false,
      msg: 'Token is not valid',
    });
  });  
  test('Responds 200 ok if endpoint exists', async () => {
    const response = await request(app)
      .get('/api/v1/auth/renew')
      .set('Accept', 'application/json')
      .set('x-token', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      token: expect.any(String),
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
