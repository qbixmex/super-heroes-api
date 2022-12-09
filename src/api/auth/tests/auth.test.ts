import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../users/users.model';

import app from '../../../app';
import { usersList } from '../../users/tests/users.fixtures';
import { encryptPassword } from '../../../helpers/encryptPassword';

let stanLeeId = '';

beforeAll(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_TEST!);

    await User.deleteMany({});

    const encryptedPassword = encryptPassword(usersList[0].password);
    await User.create({ ...usersList[0], password: encryptedPassword });

    const stanLee = await User.findOne({ email: 'stanlee@marvel.com' });

    stanLeeId = String(stanLee?._id);

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
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
