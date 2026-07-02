import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createAuthRouter from './auth.routes.js';

import prisma from '../../prisma/client';

// Define helper error sender matching server.js
const sendApiError = (res, status, code, message, details = undefined) => {
  const payload = {
    error: {
      code,
      message
    }
  };
  if (details !== undefined) {
    payload.error.details = details;
  }
  return res.status(status).json(payload);
};

describe('Auth Routes', () => {
  let app;
  let jwtSecret = 'test-secret';
  let originalEnvSecret;

  beforeEach(() => {
    originalEnvSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = jwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', createAuthRouter({ sendApiError }));

    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnvSecret;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
        name: 'Katzenfreund',
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'ValidPassword123'
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('newuser@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should fail registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_REGISTER_PAYLOAD');
    });

    it('should fail registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Short1'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_REGISTER_PAYLOAD');
    });

    it('should fail if email is already taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'ValidPassword123'
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and set auth token cookie', async () => {
      const password = 'ValidPassword123';
      const hash = await bcrypt.hash(password, 1); // Fast hashing for test
      prisma.user.findUnique.mockResolvedValue({
        id: 10,
        email: 'user@example.com',
        name: 'Leo',
        passwordHash: hash
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('user@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('auth_token=');
    });

    it('should reject login for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for incorrect password', async () => {
      const hash = await bcrypt.hash('CorrectPassword123', 1);
      prisma.user.findUnique.mockResolvedValue({
        id: 10,
        email: 'user@example.com',
        name: 'Leo',
        passwordHash: hash
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should retrieve logged in user profile', async () => {
      const token = jwt.sign({ userId: 42, email: 'me@example.com' }, jwtSecret);
      prisma.user.findUnique.mockResolvedValue({
        id: 42,
        email: 'me@example.com',
        name: 'Sabrina',
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`auth_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
        select: expect.any(Object)
      });
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('should update user name', async () => {
      const token = jwt.sign({ userId: 5, email: 'me@example.com' }, jwtSecret);
      prisma.user.update.mockResolvedValue({
        id: 5,
        email: 'me@example.com',
        name: 'NewName',
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .patch('/api/auth/me')
        .set('Cookie', [`auth_token=${token}`])
        .send({ name: 'NewName' });

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('NewName');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { name: 'NewName' },
        select: expect.any(Object)
      });
    });

    it('should fail updating user name with empty name', async () => {
      const token = jwt.sign({ userId: 5, email: 'me@example.com' }, jwtSecret);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Cookie', [`auth_token=${token}`])
        .send({ name: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_PROFILE_PAYLOAD');
    });
  });

  describe('POST /api/auth/password', () => {
    it('should change password successfully', async () => {
      const token = jwt.sign({ userId: 7, email: 'me@example.com' }, jwtSecret);
      const oldHash = await bcrypt.hash('OldPassword123', 1);

      prisma.user.findUnique.mockResolvedValue({
        id: 7,
        passwordHash: oldHash
      });
      prisma.user.update.mockResolvedValue({ id: 7 });

      const res = await request(app)
        .post('/api/auth/password')
        .set('Cookie', [`auth_token=${token}`])
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should reject if current password does not match', async () => {
      const token = jwt.sign({ userId: 7, email: 'me@example.com' }, jwtSecret);
      const oldHash = await bcrypt.hash('OldPassword123', 1);

      prisma.user.findUnique.mockResolvedValue({
        id: 7,
        passwordHash: oldHash
      });

      const res = await request(app)
        .post('/api/auth/password')
        .set('Cookie', [`auth_token=${token}`])
        .send({
          currentPassword: 'IncorrectPassword123',
          newPassword: 'NewPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookie', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(204);
      expect(res.headers['set-cookie'][0]).toContain('auth_token=;');
    });
  });
});
