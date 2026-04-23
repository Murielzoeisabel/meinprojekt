const jwt = require('jsonwebtoken');

const TOKEN_COOKIE_NAME = 'auth_token';

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: 'Nicht eingeloggt.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT-Secret ist nicht konfiguriert.' });
    }

    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Nicht eingeloggt.' });
  }
};

module.exports = authenticate;