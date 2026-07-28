let prisma;

if (process.env.NODE_ENV === 'test') {
  if (!global.__prismaMock) {
    const vi = global.vi || globalThis.vi || { fn: () => () => {} };
    global.__prismaMock = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        upsert: vi.fn()
      },
      cat: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      weightEntry: {
        upsert: vi.fn(),
        findMany: vi.fn()
      },
      communityPost: {
        findMany: vi.fn(),
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      communityMessage: {
        findMany: vi.fn(),
        create: vi.fn()
      }
    };
  }
  prisma = global.__prismaMock;
} else {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

  prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL || '')
  });
}

module.exports = prisma;