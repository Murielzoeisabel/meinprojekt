import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from './authenticate.js';

describe('authenticate middleware', () => {
  let req;
  let res;
  let next;
  let originalEnvSecret;

  beforeEach(() => {
    req = {
      cookies: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    originalEnvSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnvSecret;
    vi.restoreAllMocks();
  });

  it('should return 401 if no cookies or no token', () => {
    req.cookies = undefined;
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nicht eingeloggt.' });
    expect(next).not.toHaveBeenCalled();

    vi.clearAllMocks();
    req.cookies = {};
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 if JWT_SECRET is not configured', () => {
    delete process.env.JWT_SECRET;
    req.cookies = { auth_token: 'some-token' };
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'JWT-Secret ist nicht konfiguriert.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if verification fails', () => {
    req.cookies = { auth_token: 'invalid-token' };
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and attach user to req if token is valid', () => {
    const userPayload = { userId: 1, email: 'test@example.com' };
    const token = jwt.sign(userPayload, 'test-secret');
    req.cookies = { auth_token: token };

    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(req.user.email).toBe('test@example.com');
  });
});
