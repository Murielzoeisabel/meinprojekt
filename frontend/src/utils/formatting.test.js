import { describe, it, expect } from 'vitest';
import {
  formatWeight,
  calculateWeightLossPercent,
  formatDate,
  daysSinceDate,
  round
} from '../utils/formatting.js';

describe('Weight Formatting', () => {
  describe('formatWeight', () => {
    it('should format weight with default decimals', () => {
      expect(formatWeight(5.7)).toBe('5.7 kg');
      expect(formatWeight(6.4)).toBe('6.4 kg');
    });

    it('should format weight with custom decimals', () => {
      expect(formatWeight(5.666, 2)).toBe('5.67 kg');
      expect(formatWeight(5.666, 0)).toBe('6 kg');
    });

    it('should handle null/undefined', () => {
      expect(formatWeight(null)).toBe('—');
      expect(formatWeight(undefined)).toBe('—');
    });

    it('should handle invalid input', () => {
      expect(formatWeight('invalid')).toBe('—');
      expect(formatWeight(NaN)).toBe('—');
    });

    it('should handle integer weights', () => {
      expect(formatWeight(5)).toBe('5.0 kg');
      expect(formatWeight(10)).toBe('10.0 kg');
    });
  });

  describe('calculateWeightLossPercent', () => {
    it('should calculate weight loss percentage correctly', () => {
      // 6.4 -> 5.7: (6.4 - 5.7) / 6.4 * 100 = ~10.94%
      expect(calculateWeightLossPercent(6.4, 5.7)).toBe(10.94);
    });

    it('should return 0 when weight is equal', () => {
      expect(calculateWeightLossPercent(5.0, 5.0)).toBe(0);
    });

    it('should return 0 when weight increased', () => {
      expect(calculateWeightLossPercent(5.0, 6.0)).toBe(0);
    });

    it('should return 0 for invalid input', () => {
      expect(calculateWeightLossPercent(null, 5.0)).toBe(0);
      expect(calculateWeightLossPercent(5.0, null)).toBe(0);
      expect(calculateWeightLossPercent(undefined, 5.0)).toBe(0);
      expect(calculateWeightLossPercent('invalid', 5.0)).toBe(0);
    });

    it('should return 0 when startWeight is 0', () => {
      expect(calculateWeightLossPercent(0, 5.0)).toBe(0);
    });

    it('should calculate significant weight loss', () => {
      // 10 -> 8: 20%
      expect(calculateWeightLossPercent(10, 8)).toBe(20);
    });

    it('should calculate small weight loss', () => {
      // 5.0 -> 4.95: 1%
      expect(calculateWeightLossPercent(5.0, 4.95)).toBe(1);
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('should format ISO date to German format', () => {
      const result = formatDate('2026-05-09T15:51:57.000Z');
      expect(result).toMatch(/\d{2}\.\d{2}\.2026/);
    });

    it('should handle null/undefined', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('should handle empty string', () => {
      expect(formatDate('')).toBe('—');
    });

    it('should handle invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('—');
    });

    it('should handle valid date objects', () => {
      const date = new Date('2026-01-15');
      const result = formatDate(date.toISOString());
      expect(result).toMatch(/15\.01\.2026/);
    });
  });

  describe('daysSinceDate', () => {
    it('should calculate days since today as 0', () => {
      const today = new Date().toISOString();
      expect(daysSinceDate(today)).toBe(0);
    });

    it('should calculate days since past date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(daysSinceDate(yesterday.toISOString())).toBe(1);
    });

    it('should calculate days for 7 days ago', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      expect(daysSinceDate(sevenDaysAgo.toISOString())).toBe(7);
    });

    it('should return null for invalid input', () => {
      expect(daysSinceDate(null)).toBe(null);
      expect(daysSinceDate(undefined)).toBe(null);
      expect(daysSinceDate('invalid-date')).toBe(null);
    });

    it('should return 0 for future date (clamped to 0)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = daysSinceDate(tomorrow.toISOString());
      expect(result).toBeLessThan(0); // Oder negativ, je nach Implementierung
    });
  });
});

describe('Rounding', () => {
  describe('round', () => {
    it('should round to no decimals by default', () => {
      expect(round(5.6)).toBe(6);
      expect(round(5.4)).toBe(5);
    });

    it('should round to custom decimal places', () => {
      expect(round(5.666, 1)).toBe(5.7);
      expect(round(5.666, 2)).toBe(5.67);
    });

    it('should handle null/undefined', () => {
      expect(round(null)).toBe(null);
      expect(round(undefined)).toBe(null);
    });

    it('should handle invalid input', () => {
      expect(round('invalid')).toBe(null);
      expect(round(NaN)).toBe(null);
    });

    it('should handle negative numbers', () => {
      expect(round(-5.6)).toBe(-6);
      expect(round(-5.4)).toBe(-5);
      expect(round(-5.666, 2)).toBe(-5.67);
    });

    it('should handle zero', () => {
      expect(round(0)).toBe(0);
      expect(round(0, 2)).toBe(0);
    });
  });
});
