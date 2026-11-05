const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');
const { setupSwagger } = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const plotRoutes = require('./routes/plotRoutes');
const cropRoutes = require('./routes/cropRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const irrigationRoutes = require('./routes/irrigationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow frontend client
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiting for all API endpoints
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'Smart Agriculture and Crop Monitoring API is healthy', {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    project: 'Project No. 60 - DevOps & Full Stack Development, SR University'
  });
});

// Swagger Documentation
setupSwagger(app);

// Mount API route groups
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
