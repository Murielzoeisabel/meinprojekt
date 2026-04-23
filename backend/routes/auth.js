const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const authenticate = require('../middleware/authenticate');

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRES_IN = '24h';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttemptsByIp = new Map();

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const parseRegisterPayload = (body) => {
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || '');
  const nameFromBody = body?.name !== undefined ? String(body.name).trim() : '';

  if (!email || !isValidEmail(email)) {
    return { error: { status: 400, message: 'Bitte eine gueltige E-Mail angeben.' } };
  }

  if (!password || password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      error: {
        status: 400,
        message: 'Passwort muss mindestens 10 Zeichen lang sein und Buchstaben sowie Zahlen enthalten.'
      }
    };
  }

  const fallbackName = email.split('@')[0] || 'User';
  const name = nameFromBody || fallbackName;

  return { email, password, name };
};

const parseLoginPayload = (body) => {
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || '');

  if (!email || !password) {
    return { error: { status: 400, message: 'E-Mail und Passwort sind erforderlich.' } };
  }

  return { email, password };
};

const getLoginAttemptState = (ip) => {
  const key = String(ip || 'unknown');
  const now = Date.now();
  const current = loginAttemptsByIp.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    loginAttemptsByIp.set(key, next);
    return next;
  }

  return current;
};

const createAuthRouter = ({ sendApiError }) => {
  const router = express.Router();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET fehlt in der .env-Datei.');
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/'
  };

  router.post('/register', async (req, res) => {
    try {
      const parsed = parseRegisterPayload(req.body);
      if (parsed.error) {
        return sendApiError(res, parsed.error.status, 'INVALID_REGISTER_PAYLOAD', parsed.error.message);
      }

      const { email, password, name } = parsed;
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingUser) {
        return sendApiError(res, 409, 'EMAIL_ALREADY_EXISTS', 'E-Mail ist bereits vergeben.');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const createdUser = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      return res.status(201).json(createdUser);
    } catch (error) {
      if (error?.code === 'P2002') {
        return sendApiError(res, 409, 'EMAIL_ALREADY_EXISTS', 'E-Mail ist bereits vergeben.');
      }

      console.error('Fehler bei /api/auth/register:', error);
      return sendApiError(res, 500, 'REGISTER_FAILED', 'Registrierung fehlgeschlagen.');
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const attemptState = getLoginAttemptState(req.ip);
      if (attemptState.count >= MAX_LOGIN_ATTEMPTS) {
        return sendApiError(
          res,
          429,
          'TOO_MANY_LOGIN_ATTEMPTS',
          'Zu viele Login-Versuche. Bitte in 15 Minuten erneut versuchen.'
        );
      }

      const parsed = parseLoginPayload(req.body);
      if (parsed.error) {
        return sendApiError(res, parsed.error.status, 'INVALID_LOGIN_PAYLOAD', parsed.error.message);
      }

      const { email, password } = parsed;
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true
        }
      });

      if (!user) {
        attemptState.count += 1;
        return sendApiError(res, 401, 'INVALID_CREDENTIALS', 'E-Mail oder Passwort ungültig.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        attemptState.count += 1;
        return sendApiError(res, 401, 'INVALID_CREDENTIALS', 'E-Mail oder Passwort ungültig.');
      }

      loginAttemptsByIp.delete(String(req.ip || 'unknown'));

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        jwtSecret,
        { expiresIn: TOKEN_EXPIRES_IN }
      );

      res.cookie(TOKEN_COOKIE_NAME, token, cookieOptions);
      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Fehler bei /api/auth/login:', error);
      return sendApiError(res, 500, 'LOGIN_FAILED', 'Login fehlgeschlagen.');
    }
  });

  router.get('/me', authenticate, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      if (!user) {
        return sendApiError(res, 401, 'UNAUTHORIZED', 'Nicht eingeloggt.');
      }

      return res.json({ user });
    } catch {
      return sendApiError(res, 401, 'UNAUTHORIZED', 'Nicht eingeloggt.');
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie(TOKEN_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.status(204).send();
  });

  return router;
};

module.exports = createAuthRouter;
