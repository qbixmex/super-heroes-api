import request from 'supertest';
import app from '../../app';

describe('GET /api/v1/heroes', () => {
  test('Responds with json message', async () => {
    return request(app)
      .get('/api/v1/heroes')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body).toHaveProperty('heroes');
        expect(response.body.heroes.length).toBe(0);
      });
  });
});