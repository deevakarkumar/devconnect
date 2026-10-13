import request from 'supertest';
import { app } from './app';

describe('Server API Routes & Security Validation', () => {
  describe('Health Endpoint', () => {
    it('returns 200 with standard API envelope format', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: null,
        message: 'ok',
      });
    });
  });

  describe('Authentication Route Validation', () => {
    it('fails registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(typeof res.body.message).toBe('string');
    });

    it('fails registration with password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'dev@example.com',
          name: 'Developer',
          username: 'dev_user',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 8 character/i);
    });

    it('fails registration with invalid username characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'dev@example.com',
          name: 'Developer',
          username: 'invalid user!@#',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('fails registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'not-an-email',
          name: 'Developer',
          username: 'dev_user',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email/i);
    });

    it('clears token cookie on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out');
    });
  });

  describe('Route Protection & Authentication Middleware', () => {
    it('blocks unauthenticated access to /api/users/me', async () => {
      const res = await request(app).put('/api/users/me').send({ name: 'Hacker' });
      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        success: false,
        data: null,
        message: 'Unauthorized',
      });
    });

    it('blocks unauthenticated access to /api/posts', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('blocks unauthenticated access to /api/connections', async () => {
      const res = await request(app).get('/api/connections');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });

    it('blocks unauthenticated access to /api/dashboard', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });
  });
});
