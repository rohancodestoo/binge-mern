const request = require('supertest');
const createApp = require('./app');
const User = require('../models/User');
const Review = require('../models/Review');
const DiaryEntry = require('../models/DiaryEntry');
const Watchlist = require('../models/Watchlist');

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

describe('User Routes', () => {
  describe('GET /api/users/:username', () => {
    it('should return user profile with review count', async () => {
      const { token } = await getToken();
      // Create a review
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 5 });
      const res = await request(app).get('/api/users/testuser');
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('testuser');
      expect(res.body.reviewCount).toBe(1);
      expect(res.body.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/noonehere');
      expect(res.status).toBe(404);
    });
  });

  describe('POST/DELETE /api/users/:username/follow (Bug 1 fix)', () => {
    it('should follow a user', async () => {
      const { token } = await getToken();
      await getToken({ username: 'target', email: 'target@example.com' });

      const res = await request(app)
        .post('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/following/i);

      // Verify target's followers list
      const profile = await request(app).get('/api/users/target');
      expect(profile.body.followers).toHaveLength(1);
    });

    it('should not allow following yourself', async () => {
      const { token } = await getToken();
      const res = await request(app)
        .post('/api/users/testuser/follow')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/yourself/i);
    });

    it('should not allow duplicate follows', async () => {
      const { token } = await getToken();
      await getToken({ username: 'target', email: 'target@example.com' });

      await request(app)
        .post('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .post('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already/i);
    });

    it('should unfollow a user', async () => {
      const { token } = await getToken();
      await getToken({ username: 'target', email: 'target@example.com' });

      await request(app)
        .post('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app)
        .delete('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/unfollowed/i);

      // Verify target's followers list is now empty
      const profile = await request(app).get('/api/users/target');
      expect(profile.body.followers).toHaveLength(0);
    });

    it('Bug 1: follow should not corrupt the target user\'s password', async () => {
      const { token } = await getToken();
      await getToken({ username: 'target', email: 'target@example.com' });

      // Get the original password hash
      const beforeUser = await User.findOne({ username: 'target' });
      const originalHash = beforeUser.password;

      // Follow the user
      await request(app)
        .post('/api/users/target/follow')
        .set('Authorization', `Bearer ${token}`);

      // The password hash should be unchanged
      const afterUser = await User.findOne({ username: 'target' });
      expect(afterUser.password).toBe(originalHash);

      // Target should still be able to log in
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'target@example.com', password: 'password123' });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update profile', async () => {
      const { token } = await getToken();
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'Movie lover', avatar: 'https://example.com/avatar.jpg' });
      expect(res.status).toBe(200);
      expect(res.body.bio).toBe('Movie lover');
      expect(res.body.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should reject duplicate username', async () => {
      const { token } = await getToken();
      await getToken({ username: 'taken', email: 'taken@example.com' });
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'taken' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/taken/i);
    });
  });

  describe('POST /api/users/favorites', () => {
    it('should add a favorite', async () => {
      const { token } = await getToken();
      const res = await request(app)
        .post('/api/users/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', posterPath: '/poster.jpg' });
      expect(res.status).toBe(200);
      expect(res.body.favorites).toHaveLength(1);
    });

    it('should toggle (remove) a favorite', async () => {
      const { token } = await getToken();
      await request(app)
        .post('/api/users/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', posterPath: '/poster.jpg' });
      const res = await request(app)
        .post('/api/users/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', posterPath: '/poster.jpg' });
      expect(res.body.favorites).toHaveLength(0);
    });

    it('should enforce max 4 favorites', async () => {
      const { token } = await getToken();
      for (let i = 1; i <= 4; i++) {
        await request(app)
          .post('/api/users/favorites')
          .set('Authorization', `Bearer ${token}`)
          .send({ tmdbId: i, movieTitle: `Movie ${i}`, posterPath: '/p.jpg' });
      }
      const res = await request(app)
        .post('/api/users/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 5, movieTitle: 'Movie 5', posterPath: '/p.jpg' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/4 favorites/i);
    });
  });
});

describe('Admin Routes', () => {
  describe('Bug 7: admin middleware returns 403', () => {
    it('should return 403 for non-admin user', async () => {
      const { token } = await getToken();
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Bug 8: deleteUser cleans up related data', () => {
    it('should delete user and all associated data', async () => {
      // Create an admin user
      const admin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });
      const adminToken = require('jsonwebtoken').sign(
        { id: admin._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Create a regular user and add data
      const { token, userId } = await getToken();

      // Create reviews, diary entries, watchlist items
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', rating: 5 });
      await request(app)
        .post('/api/diary')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club', watchedOn: '2024-01-15' });
      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ tmdbId: 550, movieTitle: 'Fight Club' });

      // Delete the user via admin
      const res = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);

      // Verify all associated data is cleaned up
      const reviews = await Review.find({ user: userId });
      const diary = await DiaryEntry.find({ user: userId });
      const watchlist = await Watchlist.find({ user: userId });
      expect(reviews).toHaveLength(0);
      expect(diary).toHaveLength(0);
      expect(watchlist).toHaveLength(0);
    });
  });
});
