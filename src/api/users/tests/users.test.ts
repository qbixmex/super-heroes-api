import request from 'supertest';
import mongoose from 'mongoose';
import User from '../users.model';

import app from '../../../app';
import { usersList } from './users.fixtures';

let stanLeeId = '';
let johnDoeId = '';

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
    johnDoeId = String(johnDoe?._id);
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
});

afterEach(async () => {
  await mongoose.connection.close();
});