const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Smart Agriculture & Crop Monitoring Dashboard REST API',
    version: '1.0.0',
    description: 'RESTful API for Farm, Plot, Crop Lifecycle, Soil Observations, Irrigation, Activities, and Analytics - SR University Project No. 60'
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: {
          200: {
            description: 'API is online and healthy'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        security: [],
        responses: { 201: { description: 'Registration successful' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'User login and JWT token retrieval',
        security: [],
        responses: { 200: { description: 'Login successful' } }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        responses: { 200: { description: 'Profile returned' } }
      }
    },
    '/farms': {
      get: {
        summary: 'List all accessible farms with plot & active crop counts',
        responses: { 200: { description: 'Farms list' } }
      },
      post: {
        summary: 'Register a new farm',
        responses: { 201: { description: 'Farm created' } }
      }
    },
    '/plots': {
      get: {
        summary: 'List plots with farm info and cultivated crop',
        responses: { 200: { description: 'Plots list' } }
      },
      post: {
        summary: 'Create a new plot (validates total farm area capacity)',
        responses: { 201: { description: 'Plot created' } }
      }
    },
    '/crops': {
      get: {
        summary: 'List crops with dynamic progress %, days until harvest, and yield diff',
        responses: { 200: { description: 'Crops list' } }
      },
      post: {
        summary: 'Register crop with cultivation dates and area',
        responses: { 201: { description: 'Crop created' } }
      }
    },
    '/monitoring/soil': {
      get: {
        summary: 'Retrieve soil observation records with agronomic threshold alerts',
        responses: { 200: { description: 'Soil observations' } }
      },
      post: {
        summary: 'Record new soil observation (moisture, temp, pH, NPK)',
        responses: { 201: { description: 'Observation recorded' } }
      }
    },
    '/monitoring/environment/simulate': {
      post: {
        summary: 'Generate and save simulated sensor reading (marked Simulated/Demo)',
        responses: { 201: { description: 'Simulation reading created' } }
      }
    },
    '/irrigation': {
      get: {
        summary: 'List irrigation schedules and execution history',
        responses: { 200: { description: 'Irrigation list' } }
      },
      post: {
        summary: 'Schedule irrigation event (method, duration, water quantity)',
        responses: { 201: { description: 'Irrigation scheduled' } }
      }
    },
    '/activities': {
      get: {
        summary: 'List farm activities with total labor hours and expenditure aggregation',
        responses: { 200: { description: 'Activities list' } }
      },
      post: {
        summary: 'Record new farm activity',
        responses: { 201: { description: 'Activity recorded' } }
      }
    },
    '/dashboard/summary': {
      get: {
        summary: 'Aggregated KPI statistics, near harvest crops, and alert counts',
        responses: { 200: { description: 'Summary data' } }
      }
    },
    '/reports/crop-monitoring': {
      get: {
        summary: 'Crop-wise monitoring report with soil and growth analytics',
        responses: { 200: { description: 'Report generated' } }
      }
    },
    '/reports/farm-activities': {
      get: {
        summary: 'Farm activities and expenditure report',
        responses: { 200: { description: 'Report generated' } }
      }
    },
    '/reports/irrigation': {
      get: {
        summary: 'Irrigation usage and water consumption report',
        responses: { 200: { description: 'Report generated' } }
      }
    },
    '/reports/yield': {
      get: {
        summary: 'Yield variance and production performance report',
        responses: { 200: { description: 'Report generated' } }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = {
  setupSwagger
};
