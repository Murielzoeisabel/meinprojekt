import { describe, it, expect, vi } from 'vitest';
import prisma from '../../prisma/client';
import { createCat, deleteCat, ValidationError, NotFoundError, ForbiddenError } from './cats.service';

describe('Cats Service', () => {
  const user = { userId: 1 };
  const mockValidateCatPayload = vi.fn().mockReturnValue(null);
  const mockParsePositiveInt = vi.fn().mockImplementation((x) => {
    const val = Number(x);
    return Number.isInteger(val) && val > 0 ? val : null;
  });
  const mockGetSuggestedIdealWeight = vi.fn().mockReturnValue(4.0);
  const helpers = {
    validateCatPayload: mockValidateCatPayload,
    parsePositiveInt: mockParsePositiveInt,
    getSuggestedIdealWeight: mockGetSuggestedIdealWeight
  };

  describe('createCat', () => {
    it('should throw ValidationError if validation fails', async () => {
      mockValidateCatPayload.mockReturnValueOnce({ code: 'ERR', message: 'invalid payload' });
      await expect(createCat({}, user, helpers)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if userId is invalid', async () => {
      mockValidateCatPayload.mockReturnValueOnce(null);
      await expect(createCat({ userId: 'abc' }, user, helpers)).rejects.toThrow(ValidationError);
    });

    it('should throw ForbiddenError if userId does not match current user', async () => {
      mockValidateCatPayload.mockReturnValueOnce(null);
      await expect(createCat({ userId: '999' }, user, helpers)).rejects.toThrow(ForbiddenError);
    });

    it('should create cat successfully with defaults', async () => {
      mockValidateCatPayload.mockReturnValueOnce(null);
      prisma.cat.create.mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'Salvador',
        age: 5,
        breed: 'Mischling',
        size: 'MITTEL',
        idealWeight: 4.0,
        photo: 'photo-url'
      });

      const res = await createCat({ name: 'Salvador', age: 5 }, user, helpers);
      expect(res.name).toBe('Salvador');
      expect(res.size).toBe('mittel'); // normalized
    });
  });

  describe('deleteCat', () => {
    it('should throw ValidationError if catId is invalid', async () => {
      await expect(deleteCat('abc', user, helpers)).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if cat is not found or not owned', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce(null);
      await expect(deleteCat('1', user, helpers)).rejects.toThrow(NotFoundError);
    });

    it('should delete cat successfully', async () => {
      prisma.cat.findFirst.mockResolvedValueOnce({ id: 1, userId: 1 });
      prisma.cat.delete.mockResolvedValueOnce({ id: 1 });

      const res = await deleteCat('1', user, helpers);
      expect(res).toBe(true);
      expect(prisma.cat.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
