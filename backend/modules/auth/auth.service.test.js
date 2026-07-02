import { describe, it, expect, vi } from 'vitest';
import prisma from '../../prisma/client';
import { getUserById, getFirstUser, getOrCreateDefaultUser } from './auth.service';

describe('Auth Service', () => {
  it('getUserById should call prisma.user.findUnique', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    const result = await getUserById(1);
    expect(result.id).toBe(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true }
    });
  });

  it('getFirstUser should call prisma.user.findFirst', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 2 });
    const result = await getFirstUser();
    expect(result.id).toBe(2);
    expect(prisma.user.findFirst).toHaveBeenCalled();
  });

  it('getOrCreateDefaultUser should call prisma.user.upsert', async () => {
    prisma.user.upsert = vi.fn().mockResolvedValue({ id: 3 });
    const result = await getOrCreateDefaultUser();
    expect(result.id).toBe(3);
    expect(prisma.user.upsert).toHaveBeenCalled();
  });
});
