import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import createCommunityRouter from './community.routes.js';

// Mock mailer and webpush to prevent real network calls
vi.mock('../../utils/mailer', () => ({
  sendNewPostEmailAsync: vi.fn()
}));
vi.mock('../../utils/webpush', () => ({
  sendPushNotification: vi.fn().mockResolvedValue({})
}));

import prisma from '../../prisma/client';

const parsePositiveInt = (val) => {
  const p = Number(val);
  return Number.isInteger(p) && p > 0 ? p : null;
};
const sendApiError = (res, status, code, message) => {
  return res.status(status).json({ error: { code, message } });
};
const broadcastEvent = vi.fn();

describe('Community Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Mock authenticated user middleware
    app.use((req, res, next) => {
      req.user = { userId: 2, email: 'user@example.com' };
      next();
    });

    app.use('/api/community', createCommunityRouter({
      parsePositiveInt,
      sendApiError,
      broadcastEvent
    }));

    vi.resetAllMocks();
  });

  describe('GET /api/community/posts', () => {
    it('should return all community posts', async () => {
      prisma.communityPost.findMany.mockResolvedValue([
        {
          id: 1,
          userId: 2,
          author: 'Mia',
          text: 'Super Fortschritt!',
          likes: 5,
          hearts: 3,
          createdAt: new Date().toISOString()
        }
      ]);

      const res = await request(app).get('/api/community/posts');
      expect(res.status).toBe(200);
      expect(res.body[0].author).toBe('Mia');
      expect(res.body[0].gefaelltMir).toBe(5);
      expect(res.body[0].daumenHoch).toBe(3);
    });
  });

  describe('POST /api/community/posts', () => {
    it('should create a community post and broadcast event', async () => {
      prisma.communityPost.create.mockResolvedValue({
        id: 10,
        userId: 2,
        author: 'Mia',
        text: 'Woche 2 geschafft.',
        likes: 0,
        hearts: 0,
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/community/posts')
        .send({
          author: 'Mia',
          text: 'Woche 2 geschafft.',
          beforeWeight: 5.5,
          nowWeight: 5.2
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(10);
      expect(res.body.gefaelltMir).toBe(0);
      expect(broadcastEvent).toHaveBeenCalledWith('new-post', expect.any(Object));
    });

    it('should fail with validation error if author or text is missing', async () => {
      const res = await request(app)
        .post('/api/community/posts')
        .send({
          author: '',
          text: 'Woche 2 geschafft.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Autor und Text sind erforderlich.');
    });
  });

  describe('DELETE /api/community/posts/:id', () => {
    it('should delete a post successfully', async () => {
      prisma.communityPost.findFirst.mockResolvedValue({ id: 5, userId: 2 });
      prisma.communityPost.delete.mockResolvedValue({ id: 5 });

      const res = await request(app).delete('/api/community/posts/5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(broadcastEvent).toHaveBeenCalledWith('delete-post', { id: 5 });
    });

    it('should fail if post is not found or not owned', async () => {
      prisma.communityPost.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/community/posts/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/community/posts/:id/reactions', () => {
    it('should register reaction successfully', async () => {
      prisma.communityPost.findUnique.mockResolvedValue({ id: 5 });
      prisma.communityPost.update.mockResolvedValue({
        id: 5,
        likes: 6,
        hearts: 3
      });

      const res = await request(app)
        .post('/api/community/posts/5/reactions')
        .send({ type: 'like' });

      expect(res.status).toBe(200);
      expect(res.body.gefaelltMir).toBe(6);
      expect(broadcastEvent).toHaveBeenCalledWith('new-reaction', expect.any(Object));
    });

    it('should reject invalid reaction type', async () => {
      const res = await request(app)
        .post('/api/community/posts/5/reactions')
        .send({ type: 'invalid-type' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/community/messages', () => {
    it('should return all messages', async () => {
      prisma.communityMessage.findMany.mockResolvedValue([
        {
          id: 1,
          userName: 'Mia',
          avatar: 'avatar1.png',
          text: 'Hallo!',
          createdAt: new Date().toISOString()
        }
      ]);

      const res = await request(app).get('/api/community/messages');
      expect(res.status).toBe(200);
      expect(res.body[0].user).toBe('Mia');
      expect(res.body[0].text).toBe('Hallo!');
    });
  });

  describe('POST /api/community/messages', () => {
    it('should create a chat message and send push notification', async () => {
      prisma.communityMessage.create.mockResolvedValue({
        id: 15,
        userName: 'Mia',
        avatar: 'avatar1.png',
        text: 'Neue Nachricht!',
        createdAt: new Date().toISOString()
      });

      const res = await request(app)
        .post('/api/community/messages')
        .send({
          user: 'Mia',
          text: 'Neue Nachricht!',
          avatar: 'avatar1.png'
        });

      expect(res.status).toBe(201);
      expect(res.body.text).toBe('Neue Nachricht!');
      expect(broadcastEvent).toHaveBeenCalledWith('new-message', expect.any(Object));
    });
  });
});
