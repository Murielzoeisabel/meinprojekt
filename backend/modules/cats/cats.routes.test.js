import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import createCatsRouter from './cats.routes.js';
import jwt from 'jsonwebtoken';

import prisma from '../../prisma/client';

// Mock validateCatPayload
const validateCatPayload = vi.fn().mockReturnValue(null);
const parsePositiveInt = (val) => {
  const p = Number(val);
  return Number.isInteger(p) && p > 0 ? p : null;
};
const sendApiError = (res, status, code, message, details) => {
  return res.status(status).json({ error: { code, message, details } });
};
const getSuggestedIdealWeight = vi.fn().mockReturnValue(4.5);

describe('Cats Routes', () => {
  let app;
  let jwtSecret = 'test-secret';
  let token;
  let sseClients;

  beforeEach(() => {
    process.env.JWT_SECRET = jwtSecret;
    token = jwt.sign({ userId: 1, email: 'test@example.com' }, jwtSecret);
    sseClients = new Set();

    app = express();
    app.use(express.json());
    // Simple middleware to mock req.user auth
    app.use((req, res, next) => {
      req.user = { userId: 1, email: 'test@example.com' };
      next();
    });

    app.use('/api/cats', createCatsRouter({
      parsePositiveInt,
      sendApiError,
      validateCatPayload,
      getSuggestedIdealWeight,
      sseClients,
      FRONTEND_ORIGIN: 'http://localhost:5173'
    }));

    vi.resetAllMocks();
  });

  describe('GET /api/cats/events', () => {
    it('should establish event stream and register SSE client', () => {
      return new Promise((resolve, reject) => {
        const server = app.listen(0, () => {
          const { port } = server.address();
          const http = require('http');
          const req = http.get(`http://localhost:${port}/api/cats/events`, (res) => {
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/event-stream');
            expect(sseClients.size).toBe(1);
            res.destroy();
            req.destroy();
            server.close(resolve);
          });

          req.on('error', (err) => {
            server.close(() => reject(err));
          });
        });
      });
    });
  });

  describe('GET /api/cats', () => {
    it('should return all cats for a user', async () => {
      prisma.cat.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Fluffy',
          size: 'MITTEL',
          idealWeight: 4.5,
          weightEntries: [{ weight: 4.8, date: new Date().toISOString() }]
        }
      ]);

      const res = await request(app).get('/api/cats');
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('Fluffy');
      expect(res.body[0].currentWeight).toBe(4.8);
      expect(prisma.cat.findMany).toHaveBeenCalled();
    });
  });

  describe('GET /api/cats/:id', () => {
    it('should return a cat by ID', async () => {
      prisma.cat.findFirst.mockResolvedValue({
        id: 1,
        name: 'Fluffy',
        size: 'MITTEL',
        idealWeight: 4.5,
        weightEntries: []
      });

      const res = await request(app).get('/api/cats/1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Fluffy');
    });

    it('should return 404 if cat is not found', async () => {
      prisma.cat.findFirst.mockResolvedValue(null);
      const res = await request(app).get('/api/cats/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/cats', () => {
    it('should create a new cat', async () => {
      prisma.cat.create.mockResolvedValue({
        id: 2,
        name: 'Garfield',
        size: 'MITTEL',
        idealWeight: 5.0
      });

      const res = await request(app)
        .post('/api/cats')
        .send({ name: 'Garfield', age: 5, size: 'mittel', breed: 'Mischling' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Garfield');
      expect(prisma.cat.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/cats/:id', () => {
    it('should update an existing cat', async () => {
      prisma.cat.findFirst.mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'Fluffy',
        size: 'MITTEL',
        idealWeight: 4.5
      });
      prisma.cat.update.mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'Fluffy Updated',
        size: 'GROSS',
        idealWeight: 5.5
      });

      const res = await request(app)
        .put('/api/cats/1')
        .send({ name: 'Fluffy Updated', size: 'gross' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Fluffy Updated');
    });
  });

  describe('DELETE /api/cats/:id', () => {
    it('should delete a cat', async () => {
      prisma.cat.findFirst.mockResolvedValue({
        id: 1,
        userId: 1
      });
      prisma.cat.delete.mockResolvedValue({ id: 1 });

      const res = await request(app).delete('/api/cats/1');
      expect(res.status).toBe(204);
    });
  });

  describe('GET /api/cats/:id/weightentries', () => {
    it('should retrieve weight entries', async () => {
      const mockDate = new Date('2026-05-01T00:00:00.000Z');
      prisma.cat.findFirst.mockResolvedValue({
        id: 1,
        weightEntries: [{ weight: 4.5, date: mockDate }]
      });

      const res = await request(app).get('/api/cats/1/weightentries');
      expect(res.status).toBe(200);
      expect(res.body[0].weight).toBe(4.5);
      expect(res.body[0].date).toBe('2026-05-01');
    });
  });

  describe('POST /api/cats/:id/weightentries', () => {
    it('should create or update a weight entry', async () => {
      prisma.cat.findFirst.mockResolvedValue({ id: 1 });
      prisma.weightEntry.upsert.mockResolvedValue({});
      prisma.weightEntry.findMany.mockResolvedValue([
        { weight: 4.6, date: new Date('2026-05-02T00:00:00.000Z') }
      ]);

      const res = await request(app)
        .post('/api/cats/1/weightentries')
        .send({ weight: 4.6, date: '2026-05-02' });

      expect(res.status).toBe(201);
      expect(res.body[0].weight).toBe(4.6);
      expect(res.body[0].date).toBe('2026-05-02');
    });
  });

  describe('Validation and Error boundaries', () => {
    it('GET /api/cats/:id should return 400 if ID is not positive integer', async () => {
      const res = await request(app).get('/api/cats/invalid');
      expect(res.status).toBe(400);
    });

    it('GET /api/cats should return 500 on database error', async () => {
      prisma.cat.findMany.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).get('/api/cats');
      expect(res.status).toBe(500);
    });

    it('GET /api/cats/:id should return 500 on database error', async () => {
      prisma.cat.findFirst.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).get('/api/cats/1');
      expect(res.status).toBe(500);
    });

    it('POST /api/cats should return 400 if payload validation fails', async () => {
      validateCatPayload.mockReturnValueOnce({ code: 'ERR', message: 'invalid' });
      const res = await request(app).post('/api/cats').send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/cats should return 500 on database error', async () => {
      prisma.cat.create.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).post('/api/cats').send({ name: 'test' });
      expect(res.status).toBe(500);
    });

    it('PUT /api/cats/:id should return 400 if ID is invalid', async () => {
      const res = await request(app).put('/api/cats/invalid').send({ name: 'test' });
      expect(res.status).toBe(400);
    });

    it('PUT /api/cats/:id should return 404 if cat does not exist', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce(null);
      const res = await request(app).put('/api/cats/1').send({ name: 'test' });
      expect(res.status).toBe(404);
    });

    it('PUT /api/cats/:id should return 400 if body is invalid', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce({ id: 1 });
      validateCatPayload.mockReturnValueOnce({ code: 'ERR', message: 'invalid' });
      const res = await request(app).put('/api/cats/1').send({ name: 'test' });
      expect(res.status).toBe(400);
    });

    it('PUT /api/cats/:id should return 500 on database error', async () => {
      prisma.cat.findFirst.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).put('/api/cats/1').send({ name: 'test' });
      expect(res.status).toBe(500);
    });

    it('DELETE /api/cats/:id should return 400 if ID is invalid', async () => {
      const res = await request(app).delete('/api/cats/invalid');
      expect(res.status).toBe(400);
    });

    it('DELETE /api/cats/:id should return 404 if cat does not exist', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce(null);
      const res = await request(app).delete('/api/cats/1');
      expect(res.status).toBe(404);
    });

    it('DELETE /api/cats/:id should return 500 on database error', async () => {
      prisma.cat.findFirst.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).delete('/api/cats/1');
      expect(res.status).toBe(500);
    });

    it('GET /api/cats/:id/weightentries should return 400 if ID is invalid', async () => {
      const res = await request(app).get('/api/cats/invalid/weightentries');
      expect(res.status).toBe(400);
    });

    it('GET /api/cats/:id/weightentries should return 404 if cat does not exist', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce(null);
      const res = await request(app).get('/api/cats/1/weightentries');
      expect(res.status).toBe(404);
    });

    it('GET /api/cats/:id/weightentries should return 500 on database error', async () => {
      prisma.cat.findFirst.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).get('/api/cats/1/weightentries');
      expect(res.status).toBe(500);
    });

    it('POST /api/cats/:id/weightentries should return 400 if ID is invalid', async () => {
      const res = await request(app).post('/api/cats/invalid/weightentries').send({ weight: 5 });
      expect(res.status).toBe(400);
    });

    it('POST /api/cats/:id/weightentries should return 404 if cat does not exist', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce(null);
      const res = await request(app).post('/api/cats/1/weightentries').send({ weight: 5 });
      expect(res.status).toBe(404);
    });

    it('POST /api/cats/:id/weightentries should return 400 if weight is invalid', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce({ id: 1 });
      const res = await request(app).post('/api/cats/1/weightentries').send({ weight: -1 });
      expect(res.status).toBe(400);
    });

    it('POST /api/cats/:id/weightentries should return 400 if date is invalid', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce({ id: 1 });
      const res = await request(app).post('/api/cats/1/weightentries').send({ weight: 5, date: 'invalid-date' });
      expect(res.status).toBe(400);
    });

    it('POST /api/cats/:id/weightentries should return 500 on database error', async () => {
      prisma.cat.findFirst.mockRejectedValueOnce(new Error('Db error'));
      const res = await request(app).post('/api/cats/1/weightentries').send({ weight: 5 });
      expect(res.status).toBe(500);
    });
  });
});
