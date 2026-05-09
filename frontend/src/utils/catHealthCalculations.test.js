import { describe, it, expect } from 'vitest';
import {
  calculateIdealWeight,
  getWeightStatus,
  getCalorieRecommendation
} from '../utils/catHealthCalculations.js';

describe('Cat Health Calculations - Veterinary Guidelines', () => {
  describe('calculateIdealWeight', () => {
    describe('Normalfall: Standard-Größenkategorien', () => {
      it('should return ideal weight range for small adult cat', () => {
        const result = calculateIdealWeight('klein', 3);
        expect(result).toEqual({ min: 2.5, max: 3.5 });
      });

      it('should return ideal weight range for medium adult cat', () => {
        const result = calculateIdealWeight('mittel', 4);
        expect(result).toEqual({ min: 3.5, max: 4.5 });
      });

      it('should return ideal weight range for large adult cat', () => {
        const result = calculateIdealWeight('gross', 5);
        expect(result).toEqual({ min: 4.5, max: 5.5 });
      });

      it('should handle uppercase input', () => {
        const result = calculateIdealWeight('KLEIN', 2);
        expect(result).toEqual({ min: 2.5, max: 3.5 });
      });

      it('should handle English size categories', () => {
        expect(calculateIdealWeight('small', 2)).toEqual({ min: 2.5, max: 3.5 });
        expect(calculateIdealWeight('medium', 3)).toEqual({ min: 3.5, max: 4.5 });
        expect(calculateIdealWeight('large', 4)).toEqual({ min: 4.5, max: 5.5 });
      });
    });

    describe('Grenzfall: Jungkatzen (Wachstum)', () => {
      it('should increase weight for young kittens (0-1 year)', () => {
        const result = calculateIdealWeight('klein', 0.5);
        // 0.5 Jahre: 1 + (0.5 * 0.1) = 1.05 Faktor
        expect(result.min).toBeCloseTo(2.5 * 1.05, 1);
        expect(result.max).toBeCloseTo(3.5 * 1.05, 1);
      });

      it('should handle 0 age (newborn)', () => {
        const result = calculateIdealWeight('klein', 0);
        expect(result).toEqual({ min: 2.5, max: 3.5 });
      });

      it('should handle age 1 exactly (transition point)', () => {
        const result = calculateIdealWeight('mittel', 1);
        const expected = { min: 3.5, max: 4.5 }; // Kein Wachstumsfaktor mehr
        expect(result).toEqual(expected);
      });
    });

    describe('Grenzfall: Seniorkatzen (7+ Jahre)', () => {
      it('should decrease weight for senior cats (7+ years)', () => {
        const result = calculateIdealWeight('mittel', 7);
        // Genau 7 Jahre: kein Abzug (0 Jahre älter als 7)
        expect(result).toEqual({ min: 3.5, max: 4.5 });
      });

      it('should apply 2% weight reduction per year after age 7', () => {
        const result = calculateIdealWeight('mittel', 8);
        // 8 Jahre: 1 Jahr älter als 7 = -2% = 0.98 Faktor
        const expected = {
          min: Math.round(3.5 * 0.98 * 100) / 100,
          max: Math.round(4.5 * 0.98 * 100) / 100
        };
        expect(result).toEqual(expected);
      });

      it('should not reduce below 80% of ideal weight for senior', () => {
        const result = calculateIdealWeight('mittel', 20);
        // 20 Jahre: 13 Jahre älter = -26% = 0.74, aber min 80% = 0.8
        const minAllowed = 3.5 * 0.8; // 2.8
        expect(result.min).toBeLessThanOrEqual(3.5);
        expect(result.min).toBeCloseTo(minAllowed, 1); // Erlaubt Floating-Point-Fehler
      });
    });

    describe('Fehlerfall: Ungültige Eingaben', () => {
      it('should return null for invalid size', () => {
        expect(calculateIdealWeight('XL', 3)).toBeNull();
        expect(calculateIdealWeight('tiny', 3)).toBeNull();
      });

      it('should return null for missing inputs', () => {
        expect(calculateIdealWeight(null, 3)).toBeNull();
        expect(calculateIdealWeight('klein', null)).toBeNull();
        expect(calculateIdealWeight(undefined, 5)).toBeNull();
      });

      it('should return null for negative age', () => {
        expect(calculateIdealWeight('klein', -1)).toBeNull();
      });

      it('should return null for non-numeric age', () => {
        expect(calculateIdealWeight('klein', 'five')).toBeNull();
        expect(calculateIdealWeight('klein', NaN)).toBeNull();
      });

      it('should handle empty string size', () => {
        expect(calculateIdealWeight('', 3)).toBeNull();
        expect(calculateIdealWeight('   ', 3)).toBeNull();
      });
    });
  });

  describe('getWeightStatus', () => {
    describe('Normalfall: Gewicht im Idealbereich', () => {
      it('should return ideal status for weight in range', () => {
        const result = getWeightStatus(4.0, 3.5, 4.5);
        expect(result).toEqual({ status: 'ideal', label: 'Idealgewicht' });
      });

      it('should return ideal status at min boundary', () => {
        const result = getWeightStatus(3.5, 3.5, 4.5);
        expect(result).toEqual({ status: 'ideal', label: 'Idealgewicht' });
      });

      it('should return ideal status at max boundary', () => {
        const result = getWeightStatus(4.5, 3.5, 4.5);
        expect(result).toEqual({ status: 'ideal', label: 'Idealgewicht' });
      });
    });

    describe('Grenzfall: Unter- und Übergewicht', () => {
      it('should return underweight status', () => {
        const result = getWeightStatus(3.0, 3.5, 4.5);
        expect(result).toEqual({ status: 'underweight', label: 'Untergewicht' });
      });

      it('should return overweight status with percentage', () => {
        const result = getWeightStatus(5.0, 3.5, 4.5);
        expect(result.status).toBe('overweight');
        expect(result.label).toBe('Übergewicht');
        expect(result.percentOver).toBe(11); // (5.0 - 4.5) / 4.5 * 100 = 11%
      });

      it('should calculate percentage for significant overweight', () => {
        const result = getWeightStatus(5.4, 3.5, 4.5);
        expect(result.percentOver).toBe(20); // 20% übergewichtig
      });
    });

    describe('Fehlerfall: Ungültige Eingaben', () => {
      it('should return null for missing inputs', () => {
        expect(getWeightStatus(null, 3.5, 4.5)).toBeNull();
        expect(getWeightStatus(4.0, null, 4.5)).toBeNull();
        expect(getWeightStatus(4.0, 3.5, null)).toBeNull();
      });

      it('should coerce numeric strings (JavaScript behavior)', () => {
        // JavaScript konvertiert '4.0' zu 4.0, das ist das normale Verhalten
        const result = getWeightStatus('4.0', 3.5, 4.5);
        expect(result).toEqual({ status: 'ideal', label: 'Idealgewicht' });
      });

      it('should return null for truly invalid inputs', () => {
        expect(getWeightStatus(4.0, 'min', 4.5)).toBeNull();
        expect(getWeightStatus(4.0, 3.5, 'max')).toBeNull();
      });

      it('should return null for invalid ranges', () => {
        expect(getWeightStatus(4.0, NaN, 4.5)).toBeNull();
      });
    });
  });

  describe('getCalorieRecommendation', () => {
    describe('Normalfall: Kalorienberechnung', () => {
      it('should calculate calories for ideal weight cat', () => {
        // 4kg ideal = 4 * 70 = 280 kcal
        expect(getCalorieRecommendation(4, 'ideal')).toBe(280);
      });

      it('should calculate higher calories for underweight', () => {
        // 3kg underweight = 3 * 80 = 240 kcal
        expect(getCalorieRecommendation(3, 'underweight')).toBe(240);
      });

      it('should calculate reduced calories for overweight', () => {
        // 5kg overweight = 5 * 50 = 250 kcal (sanftes Abnehmen)
        expect(getCalorieRecommendation(5, 'overweight')).toBe(250);
      });
    });

    describe('Grenzfall: Edge-Cases', () => {
      it('should handle uppercase status', () => {
        expect(getCalorieRecommendation(4, 'IDEAL')).toBe(280);
      });

      it('should handle different decimal weights', () => {
        expect(getCalorieRecommendation(4.5, 'ideal')).toBe(315);
        expect(getCalorieRecommendation(2.5, 'ideal')).toBe(175);
      });

      it('should round to nearest integer', () => {
        // 3.3kg * 70 = 231 kcal
        expect(getCalorieRecommendation(3.3, 'ideal')).toBe(231);
      });
    });

    describe('Fehlerfall: Ungültige Eingaben', () => {
      it('should return null for missing inputs', () => {
        expect(getCalorieRecommendation(null, 'ideal')).toBeNull();
        expect(getCalorieRecommendation(4, null)).toBeNull();
      });

      it('should return null for invalid status', () => {
        expect(getCalorieRecommendation(4, 'obese')).toBeNull();
      });

      it('should return null for zero or negative weight', () => {
        expect(getCalorieRecommendation(0, 'ideal')).toBeNull();
        expect(getCalorieRecommendation(-1, 'ideal')).toBeNull();
      });

      it('should return null for non-numeric weight', () => {
        expect(getCalorieRecommendation('4kg', 'ideal')).toBeNull();
        expect(getCalorieRecommendation(NaN, 'ideal')).toBeNull();
      });
    });
  });

  describe('🚨 KRITISCHER FEHLENDER TEST: Extreme Seniorenkatzen', () => {
    it('should handle extremely old cats (25+ years) safely', () => {
      // Das ist ein echtes Sicherheits-Edge-Case!
      // Bei zu vielen Jahren könnte der Gewichtsverlust negativ werden
      const result = calculateIdealWeight('mittel', 25);
      expect(result).not.toBeNull();
      expect(result.min).toBeGreaterThan(0);
      expect(result.max).toBeGreaterThan(0);
      expect(result.min).toBeLessThanOrEqual(3.5); // Nicht größer als ideal
    });

    it('should not allow min to exceed max even for old cats', () => {
      const result = calculateIdealWeight('mittel', 30);
      expect(result.min).toBeLessThanOrEqual(result.max);
    });

    it('should maintain realistic values for cats at age 10', () => {
      // 10 Jahre = 3 Jahre älter als 7 = -6% = 0.94 Faktor
      const result = calculateIdealWeight('mittel', 10);
      const expectedMin = Math.round(3.5 * 0.94 * 100) / 100;
      const expectedMax = Math.round(4.5 * 0.94 * 100) / 100;
      expect(result).toEqual({ min: expectedMin, max: expectedMax });
    });
  });
});
