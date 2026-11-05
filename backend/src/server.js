const app = require('./app');
const env = require('./config/env');
const { initDb } = require('./config/db');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    logger.info('Initializing Smart Agriculture & Crop Monitoring Platform backend...');
    
    // Auto-verify / init database tables and seed data
    await initDb();

    const server = app.listen(env.PORT, () => {
      logger.info(`=============================================================`);
      logger.info(`  Smart Agriculture & Crop Monitoring Dashboard REST API   `);
      logger.info(`  SR University - Project No. 60 (DevOps & Full Stack)     `);
      logger.info(`  Status: RUNNING on http://localhost:${env.PORT}             `);
      logger.info(`  Health check: http://localhost:${env.PORT}/api/health       `);
      logger.info(`  Swagger Docs: http://localhost:${env.PORT}/api/docs         `);
      logger.info(`=============================================================`);
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down HTTP server...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
