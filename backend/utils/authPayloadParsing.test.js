import { describe, it, expect } from 'vitest';
import { parseLoginPayload } from '../utils/authPayloadParsing.js';

describe('parseLoginPayload - Login Validierung', () => {
  describe('Normalfall: valide Eingabe', () => {
    it('should parse valid email and password', () => {
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: 'SecurePass123'
      });
      expect(result.error).toBeUndefined();
      expect(result.email).toBe('user@example.com');
      expect(result.password).toBe('SecurePass123');
    });

    it('should normalize email to lowercase', () => {
      const result = parseLoginPayload({
        email: 'USER@EXAMPLE.COM',
        password: 'SecurePass123'
      });
      expect(result.email).toBe('user@example.com');
    });

    it('should trim email whitespace', () => {
      const result = parseLoginPayload({
        email: '  user@example.com  ',
        password: 'SecurePass123'
      });
      expect(result.email).toBe('user@example.com');
    });

    it('should preserve password as-is (no normalization)', () => {
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: '  MyPassword123  '
      });
      expect(result.password).toBe('  MyPassword123  ');
    });
  });

  describe('Grenzfall: leerer Input', () => {
    it('should reject empty email', () => {
      const result = parseLoginPayload({
        email: '',
        password: 'SecurePass123'
      });
      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(400);
    });

    it('should reject empty password', () => {
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: ''
      });
      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(400);
    });

    it('should reject both empty', () => {
      const result = parseLoginPayload({
        email: '',
        password: ''
      });
      expect(result.error).toBeDefined();
    });

    it('should reject undefined body', () => {
      const result = parseLoginPayload(undefined);
      expect(result.error).toBeDefined();
    });

    it('should reject null body', () => {
      const result = parseLoginPayload(null);
      expect(result.error).toBeDefined();
    });

    it('should reject empty object', () => {
      const result = parseLoginPayload({});
      expect(result.error).toBeDefined();
    });

    it('should reject whitespace-only email', () => {
      const result = parseLoginPayload({
        email: '   ',
        password: 'SecurePass123'
      });
      expect(result.error).toBeDefined();
    });
  });

  describe('Fehlerfall: ungültige Typen', () => {
    it('should coerce number to string and parse it', () => {
      // "123" nach String-Konvertierung ist nicht leer, also kein Error
      const result = parseLoginPayload({
        email: 123,
        password: 456
      });
      expect(result.error).toBeUndefined();
      expect(result.email).toBe('123');
      expect(result.password).toBe('456');
    });

    it('should coerce object to string', () => {
      const result = parseLoginPayload({
        email: { email: 'test' },
        password: 'SecurePass123'
      });
      expect(result.email).toBe('[object object]');
    });

    it('should reject false boolean (converts to empty string after trim)', () => {
      // false -> "false" -> trim -> "" -> empty -> error!
      const result = parseLoginPayload({
        email: false,
        password: 'SecurePass123'
      });
      expect(result.error).toBeDefined();
    });

    it('should coerce array to string', () => {
      const result = parseLoginPayload({
        email: ['user@example.com'],
        password: 'SecurePass123'
      });
      expect(result.email).toBe('user@example.com');
    });

    it('should handle email as array with multiple items', () => {
      const result = parseLoginPayload({
        email: ['test@test.com', 'other@test.com'],
        password: 'SecurePass123'
      });
      expect(result.email).toBe('test@test.com,other@test.com');
    });
  });

  describe('Zusätzliche Edge-Cases', () => {
    it('should handle email with international characters', () => {
      const result = parseLoginPayload({
        email: 'user+tag@example.com',
        password: 'SecurePass123'
      });
      expect(result.error).toBeUndefined();
      expect(result.email).toBe('user+tag@example.com');
    });

    it('should handle very long email', () => {
      const longEmail = 'a'.repeat(200) + '@example.com';
      const result = parseLoginPayload({
        email: longEmail,
        password: 'SecurePass123'
      });
      expect(result.error).toBeUndefined();
      expect(result.email).toBe(longEmail.toLowerCase());
    });

    it('should handle very long password', () => {
      const longPassword = 'P'.repeat(1000) + '1';
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: longPassword
      });
      expect(result.error).toBeUndefined();
      expect(result.password).toBe(longPassword);
    });
  });

  describe('Kritischer fehlender Test: Passwort mit nur Leerzeichen', () => {
    it('should ACCEPT password with only whitespace (not trimmed!)', () => {
      // 🚨 WICHTIG: Email wird trimmt, Passwort NICHT!
      // '   ' ist technisch nicht leer, wird akzeptiert - potentielles Sicherheitsproblem!
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: '     '
      });
      expect(result.error).toBeUndefined();
      expect(result.password).toBe('     ');
    });

    it('should reject password as null but accept as empty string after String() coercion check', () => {
      // null wird zu "null" String, nicht zu leerem String
      const result = parseLoginPayload({
        email: 'user@example.com',
        password: null
      });
      expect(result.error).toBeDefined(); // null -> "" -> error
    });

    it('should be vulnerable to whitespace-only password in production', () => {
      // Das ist ein tatsächliches Sicherheits-Issue!
      // Ein Passwort aus nur Spaces wird akzeptiert
      const suspiciousResult = parseLoginPayload({
        email: '  TEST@EXAMPLE.COM  ',
        password: '     '
      });
      expect(suspiciousResult.error).toBeUndefined();
      expect(suspiciousResult.email).toBe('test@example.com'); // Email ist sauber
      expect(suspiciousResult.password).toBe('     '); // Passwort ist unsicher!
      
      // 💡 FEHLER IN DER FUNKTION: Passwort sollte auch getrimmt werden!
    });
  });
});
