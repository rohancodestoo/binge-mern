const request = require('supertest');
const createApp = require('./app');
const DiaryEntry = require('../models/DiaryEntry');

const app = createApp();

const getToken = async (overrides = {}) => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(userData);
  return { token: res.body.token, userId: res.body._id };
};

describe('Diary Routes', () => {
  let token;

  beforeEach(async () => {
    ({ token } = await getToken());
  });

  describe('POST /api/diary', () => {
    it('should create a diary entry', async () => {
      const res = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          posterPath: '/poster.jpg',
          watchedOn: '2024-01-15',
          rating: 4.5,
          review: 'Amazing film',
          rewatch: false,
        });
      expect(res.status).toBe(201);
      expect(res.body.tmdbId).toBe(550);
      expect(res.body.rating).toBe(4.5);
    });

    it('should reject future watch dates', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const res = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          watchedOn: futureDate.toISOString(),
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/future/i);
    });

    it('should reject watch dates before release date', async () => {
      const res = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          watchedOn: '1990-01-01',
          releaseDate: '1999-10-15',
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/release date/i);
    });
  });

  describe('GET /api/diary', () => {
    it('should return user diary entries', async () => {
      await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', watchedOn: '2024-01-15' });
      const res = await request(app)
        .get('/api/diary')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('PUT /api/diary/:id (Bug 2 fix verification)', () => {
    it('should update allowed fields only', async () => {
      const create = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          watchedOn: '2024-01-15',
          rating: 3,
        });
      const entryId = create.body._id;

      const res = await request(app)
        .put(`/api/diary/${entryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, review: 'Updated review' });
      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(5);
      expect(res.body.review).toBe('Updated review');
    });

    it('should NOT allow overriding the user field (field injection)', async () => {
      const create = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          watchedOn: '2024-01-15',
        });
      const entryId = create.body._id;
      const originalUser = create.body.user;

      // Attempt field injection: try to change the `user` field
      const res = await request(app)
        .put(`/api/diary/${entryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: '000000000000000000000000', rating: 5 });
      expect(res.status).toBe(200);
      // The user field should NOT have changed
      expect(res.body.user).toBe(originalUser);
    });

    it('should not allow another user to update', async () => {
      const create = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', watchedOn: '2024-01-15' });
      const otherToken = (await getToken({
        username: 'other',
        email: 'other@example.com',
      })).token;
      const res = await request(app)
        .put(`/api/diary/${create.body._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ rating: 1 });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/diary/:id', () => {
    it('should delete own diary entry', async () => {
      const create = await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', watchedOn: '2024-01-15' });
      const res = await request(app)
        .delete(`/api/diary/${create.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
