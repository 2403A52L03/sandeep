/**
 * Standalone Database Initialization Script
 * Connects to PostgreSQL, executes schema.sql and seed.sql
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('../src/config/env');

const run = async () => {
  console.log('[Init] Connecting to PostgreSQL database at', env.DB.host, '...');
  const pool = new Pool({
    connectionString: env.DB.connectionString,
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.database
  });

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

    console.log('[Init] Executing schema.sql...');
    await pool.query(schemaSql);
    console.log('[Init] Schema created successfully.');

    console.log('[Init] Executing seed.sql...');
    await pool.query(seedSql);
    console.log('[Init] Demo seed data loaded successfully.');

    await pool.end();
    console.log('[Init] Database initialization complete.');
    process.exit(0);
  } catch (err) {
    console.error('[Init] Error during database initialization:', err);
    await pool.end();
    process.exit(1);
  }
};

run();
