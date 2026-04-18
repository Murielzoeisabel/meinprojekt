const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const sqlitePath = databaseUrl.startsWith('file:') ? databaseUrl.replace(/^file:/, '') : databaseUrl;

const adapter = new PrismaBetterSqlite3({ url: sqlitePath });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;