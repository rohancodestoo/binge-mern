const request = require('supertest');
const createApp = require('./app');

const app = createApp();

// Helper: register and return token
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

describe('Review Routes', () => {
  let token;

  beforeEach(async () => {
    token = await getToken();
  });

  describe('POST /api/reviews', () => {
    it('should create a review', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: 550,
          movieTitle: 'Fight Club',
          posterPath: '/poster.jpg',
          rating: 4.5,
          content: 'Great movie!',
        });
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(4.5);
      expect(res.body.content).toBe('Great movie!');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should not allow duplicate review for same movie', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4 });
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 3 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already reviewed/i);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4 });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reviews/movie/:tmdbId', () => {
    it('should return reviews for a movie', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 5, content: 'Masterpiece' });
      const res = await request(app).get('/api/reviews/movie/550');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].rating).toBe(5);
      expect(res.body[0].user).toHaveProperty('username', 'testuser');
    });

    it('should return empty array for movie with no reviews', async () => {
      const res = await request(app).get('/api/reviews/movie/999999');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('PUT /api/reviews/:id', () => {
    it('should update a review (Bug 3: should include populated user)', async () => {
      const create = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4, content: 'Good' });
      const reviewId = create.body._id;

      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, content: 'Actually great!' });
      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(5);
      expect(res.body.content).toBe('Actually great!');
      expect(res.body.isEdited).toBe(true);
      // Bug 3 fix verification: user should be populated
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should not allow editing a review more than once', async () => {
      const create = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4, content: 'Good' });
      const reviewId = create.body._id;

      // First edit — should succeed
      await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5 });

      // Second edit — should fail
      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 3 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/only.*once/i);
    });

    it('should not allow editing another user\'s review', async () => {
      const create = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4 });
      const reviewId = create.body._id;

      const otherToken = await getToken({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ rating: 1 });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('should delete own review', async () => {
      const create = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4 });
      const res = await request(app)
        .delete(`/api/reviews/${create.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });

    it('should not delete another user\'s review', async () => {
      const create = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 4 });
      const otherToken = await getToken({
        username: 'otheruser',
        email: 'other@example.com',
      });
      const res = await request(app)
        .delete(`/api/reviews/${create.body._id}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });
  });
});
