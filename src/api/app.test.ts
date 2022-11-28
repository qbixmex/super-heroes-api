import request from 'supertest';
import app from '../app';

describe('Tests on App', () => {
  test('Responds with a not found message', (done) => {
    request(app)
      .get('/this-should-fail')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });  
});

describe('GET / Endpoint', () => {
  test('Responds with json message', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
      }, done);
  });
});

describe('GET /api/v1', () => {
  test('Responds with json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: '👋🌎',
      }, done);
  });
});
