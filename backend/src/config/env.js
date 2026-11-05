const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'smart_agri_db',
    connectionString: process.env.DATABASE_URL
  },
  JWT_SECRET: process.env.JWT_SECRET || 'sr_university_smart_agriculture_secret_key_2026_devops',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
