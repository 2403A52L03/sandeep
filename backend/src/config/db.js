const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const env = require('./env');
const logger = require('../utils/logger');

let pool = null;
let isFallback = false;
let fallbackDb = null;

/**
 * Initializes and returns the active database connection
 */
const getPool = () => {
  if (pool) return pool;

  pool = new Pool({
    connectionString: env.DB.connectionString,
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.database,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000,
    max: 20
  });

  pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client:', err);
  });

  return pool;
};

/**
 * Initializes embedded in-memory PostgreSQL (pg-mem) fallback
 */
const initFallbackDb = () => {
  if (fallbackDb) return fallbackDb;

  try {
    const { newDb } = require('pg-mem');
    const memDb = newDb();

    // Register basic functions if needed
    memDb.public.registerFunction({
      name: 'setval',
      args: ['text', 'int'],
      returns: 'int',
      implementation: (seq, val) => val
    });

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      memDb.public.none(schemaSql);
    }

    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      memDb.public.none(seedSql);
    }

    const adapter = memDb.adapters.createPg();
    fallbackDb = new adapter.Pool();
    isFallback = true;

    logger.info('[Database] Initialized Embedded PostgreSQL (pg-mem) fallback with complete schema and seed data.');
    return fallbackDb;
  } catch (err) {
    logger.error('Failed to initialize fallback database:', err);
    throw err;
  }
};

/**
 * Executes a SQL query against PostgreSQL or fallback instance
 * @param {string} text SQL statement
 * @param {Array} params Parameterized values
 */
const query = async (text, params = []) => {
  if (isFallback) {
    return fallbackDb.query(text, params);
  }

  try {
    const activePool = getPool();
    return await activePool.query(text, params);
  } catch (err) {
    // If live PostgreSQL connection fails (e.g. port 5432 closed or ECONNREFUSED)
    if (err.code === 'ECONNREFUSED' || err.message.includes('timeout') || err.message.includes('connect')) {
      logger.warn('[Database] Live PostgreSQL unreachable. Transitioning to Embedded PostgreSQL engine for seamless demonstration...');
      const mem = initFallbackDb();
      return await mem.query(text, params);
    }
    throw err;
  }
};

/**
 * Initializes database tables on startup if not present
 */
const initDb = async () => {
  try {
    // Test live connection first
    const activePool = getPool();
    await activePool.query('SELECT 1');
    logger.info('[Database] Connected to live PostgreSQL server.');

    // Check if tables exist
    const res = await activePool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    );

    if (res.rows.length === 0) {
      logger.info('[Database] No existing schema detected. Applying schema.sql and seed.sql...');
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      const seedPath = path.join(__dirname, '../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        await activePool.query(fs.readFileSync(schemaPath, 'utf8'));
      }
      if (fs.existsSync(seedPath)) {
        await activePool.query(fs.readFileSync(seedPath, 'utf8'));
      }
      logger.info('[Database] Schema and realistic seed data applied successfully.');
    }
  } catch (err) {
    logger.warn(`[Database] PostgreSQL server not running locally (${err.message}). Starting Embedded PostgreSQL engine...`);
    initFallbackDb();
  }
};

module.exports = {
  query,
  getPool,
  initDb,
  isFallback: () => isFallback
};
