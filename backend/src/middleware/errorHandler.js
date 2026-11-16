const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Centralized Application Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - Error:`, err.message || err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, 'Validation Error', err.errors || err.message);
  }

  if (err.code === '23505') { // Postgres unique_violation
    return errorResponse(res, 409, 'A record with this unique identifier already exists.', err.detail);
  }

  if (err.code === '23503') { // Postgres foreign_key_violation
    return errorResponse(res, 400, 'Referenced parent record does not exist.', err.detail);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, statusCode, message, process.env.NODE_ENV === 'development' ? err.stack : []);
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Endpoint ${req.method} ${req.originalUrl} not found.`);
};

module.exports = {
  errorHandler,
  notFoundHandler
};

