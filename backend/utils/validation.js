/**
 * Normalisiert eine Email: trim + lowercase
 */
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

/**
 * Validiert eine Email mit Regex-Pattern
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validiert ein Passwort:
 * - mindestens 10 Zeichen
 * - enthält Buchstaben (A-Z oder a-z)
 * - enthält Zahlen (0-9)
 */
const isValidPassword = (password) => {
  const passwordStr = String(password || '');
  return (
    passwordStr.length >= 10 &&
    /[A-Za-z]/.test(passwordStr) &&
    /\d/.test(passwordStr)
  );
};

module.exports = {
  normalizeEmail,
  isValidEmail,
  isValidPassword
};
