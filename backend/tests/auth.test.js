const request = require('supertest');
const app = require('../src/app');
const { initDb } = require('../src/config/db');

describe('Authentication & RBAC Test Suite', () => {
  beforeAll(async () => {
    await initDb();
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in Admin user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@smartagri.edu',
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should successfully log in Farmer user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'farmer@smartagri.edu',
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('farmer');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@smartagri.edu',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new farmer and default to farmer role', async () => {
      const randomEmail = `newfarmer_${Date.now()}@smartagri.edu`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test Farmer',
          email: randomEmail,
          phone: '+91 9988771122',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'farmer'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('farmer');
    });

    it('should prevent self-registration as admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Hacker',
          email: 'hacker@test.com',
          password: 'Password@123',
          confirmPassword: 'Password@123',
          role: 'admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});

