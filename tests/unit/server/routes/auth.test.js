const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../../server/routes/auth');

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authRoutes);
  });

  describe('POST /auth/login', () => {
    test('should login with demo credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'demo',
          password: 'demo'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('demo');
      expect(response.body.user.email).toBe('demo@example.com');
      expect(response.body.token).toBe('demo-token');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'invalid',
          password: 'invalid'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject missing username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'demo'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'demo'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/register', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser'
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required');
    });

    test('should reject duplicate username', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          username: 'duplicate',
          email: 'first@example.com',
          password: 'password123'
        });

      // Second registration with same username
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'duplicate',
          email: 'second@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User already exists');
    });

    test('should reject duplicate email', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          username: 'user1',
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('GET /auth/profile', () => {
    test('should return profile endpoint message', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Profile endpoint');
    });
  });
});