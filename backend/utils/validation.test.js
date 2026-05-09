import { describe, it, expect } from 'vitest';
import { normalizeEmail, isValidEmail, isValidPassword } from '../utils/validation.js';

describe('Email Validation', () => {
  describe('normalizeEmail', () => {
    it('should normalize email: trim and lowercase', () => {
      const result = normalizeEmail('  JOHN@EXAMPLE.COM  ');
      expect(result).toBe('john@example.com');
    });

    it('should handle null/undefined', () => {
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(normalizeEmail('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
    });

    it('should reject email without @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@ example.com')).toBe(false);
    });

    it('should reject email without TLD', () => {
      expect(isValidEmail('user@example')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });
});

describe('Password Validation', () => {
  describe('isValidPassword', () => {
    it('should accept valid password (10+ chars, letters, numbers)', () => {
      expect(isValidPassword('SecurePass123')).toBe(true);
      expect(isValidPassword('MyPassword1')).toBe(true);
    });

    it('should reject password shorter than 10 characters', () => {
      expect(isValidPassword('Short1')).toBe(false);
    });

    it('should reject password without letters', () => {
      expect(isValidPassword('1234567890')).toBe(false);
    });

    it('should reject password without numbers', () => {
      expect(isValidPassword('OnlyLetters')).toBe(false);
    });

    it('should reject empty or null password', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
      expect(isValidPassword(undefined)).toBe(false);
    });

    it('should accept password with special characters', () => {
      expect(isValidPassword('P@ssw0rd!Test')).toBe(true);
    });
  });
});
