import request from 'supertest';
import app from '../../app';

describe('GET /api/v1/heroes', () => {
  test('Responds with a heroes objects array', async () => {
    return request(app)
      .get('/api/v1/heroes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('length');
        expect(response.body.length).toBe(3);
      });
  });
});

describe('GET /api/v1/heroes/123', () => {
  test('Responds with a single hero object', async () => {
    return request(app)
      .get('/api/v1/heroes/123')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body).toEqual({
          id: 123,
          heroName: 'Spiderman',
          realName: 'Peter Parker',
          studio: 'Marvel',
        });
      });
  });
});

describe('POST /api/v1/heroes', () => {
  test('Responds with response 200', async () => {
    return request(app)
      .post('/api/v1/heroes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });
});

describe('PATCH /api/v1/heroes/123', () => {
  test('Responds with response 200', async () => {
    return request(app)
      .patch('/api/v1/heroes/123')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body).toEqual({
          id: 123,
          heroName: 'Spiderman',
          realName: 'Peter Parker',
          studio: 'Marvel',
        });
      });
  });
});

describe('DELETE /api/v1/heroes/123', () => {
  test('Responds with response 200', async () => {
    return request(app)
      .delete('/api/v1/heroes/123')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });
});