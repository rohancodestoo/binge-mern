const request = require('supertest');
const createApp = require('./app');

const app = createApp();

const getToken = async (overrides = {}) => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(userData);
  return res.body.token;
};

describe('Watchlist Routes', () => {
  let token;

  beforeEach(async () => {
    token = await getToken();
  });

  describe('POST /api/watchlist', () => {
    it('should add a movie to watchlist', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          posterPath: '/poster.jpg',
          releaseDate: '1999-10-15',
        });
      expect(res.status).toBe(201);
      expect(res.body.tmdbId).toBe(550);
      expect(res.body.movieTitle).toBe('Fight Club');
    });

    it('should not add duplicate movie', async () => {
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already/i);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/watchlist', () => {
    it('should return user watchlist', async () => {
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 680, movieTitle: 'Pulp Fiction' });
      const res = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should not show other user\'s watchlist', async () => {
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      const otherToken = await getToken({
        username: 'other',
        email: 'other@example.com',
      });
      const res = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('DELETE /api/watchlist/:tmdbId', () => {
    it('should remove from watchlist', async () => {
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });
      const res = await request(app)
        .delete('/api/watchlist/550')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
      // Verify it's actually gone
      const list = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${token}`);
      expect(list.body).toHaveLength(0);
    });

    it('should return 404 for non-existent item', async () => {
      const res = await request(app)
        .delete('/api/watchlist/999999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
