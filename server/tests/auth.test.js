const request = require('supertest');
const createApp = require('./app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const app = createApp();

// Helper: register a user and return the response data (including token)
const registerUser = async (overrides = {}) => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);
  return res;
};

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await registerUser();
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('_id');
      expect(res.body.username).toBe('testuser');
      expect(res.body.email).toBe('test@example.com');
      // Should NOT return password
      expect(res.body.password).toBeUndefined();
    });

    it('should not register with duplicate email', async () => {
      await registerUser();
      const res = await registerUser({ username: 'different' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already taken/i);
    });

    it('should not register with duplicate username', async () => {
      await registerUser();
      const res = await registerUser({ email: 'different@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already taken/i);
    });

    it('should hash the password before storing', async () => {
      await registerUser();
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.password).not.toBe('password123');
      expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await registerUser();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toBe('testuser');
    });

    it('should reject invalid password', async () => {
      await registerUser();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const reg = await registerUser();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('testuser');
      // Password should be excluded
      expect(res.body.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
    });
  });
});
