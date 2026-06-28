const prisma = require('../../prisma/client');
const bcrypt = require('bcrypt');

async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });
}

async function getFirstUser() {
  return prisma.user.findFirst({
    orderBy: { id: 'asc' },
    select: { id: true }
  });
}

async function getOrCreateDefaultUser() {
  return prisma.user.upsert({
    where: { email: 'default@cat-slim-down.local' },
    update: {},
    create: {
      email: 'default@cat-slim-down.local',
      name: 'Default User',
      passwordHash: await bcrypt.hash('default-user-only', 12)
    },
    select: { id: true }
  });
}

module.exports = {
  getUserById,
  getFirstUser,
  getOrCreateDefaultUser
};
