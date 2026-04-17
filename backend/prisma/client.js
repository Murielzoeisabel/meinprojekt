const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSQLite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const sqlitePath = databaseUrl.startsWith('file:') ? databaseUrl.replace(/^file:/, '') : databaseUrl;

const adapter = new PrismaBetterSQLite3(new Database(sqlitePath));

const prisma = new PrismaClient({ adapter });

module.exports = prisma;