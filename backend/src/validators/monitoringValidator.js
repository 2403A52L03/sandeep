const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const soilObservationValidator = [
  body('farm_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Farm ID required'),
  body('plot_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Plot ID required'),
  body('observation_date').notEmpty().isISO8601().withMessage('Valid observation date required'),
  body('soil_moisture').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('Moisture must be 0-100%'),
  body('soil_temperature').optional({ nullable: true }).isFloat().withMessage('Temperature must be a valid number'),
  body('soil_ph').optional({ nullable: true }).isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('nitrogen').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Nitrogen cannot be negative'),
  body('phosphorus').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Phosphorus cannot be negative'),
  body('potassium').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Potassium cannot be negative'),
  handleValidationErrors
];

const environmentalReadingValidator = [
  body('farm_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Farm ID required'),
  body('plot_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Plot ID required'),
  body('temperature').optional({ nullable: true }).isFloat().withMessage('Temperature must be numeric'),
  body('humidity').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('Humidity must be 0-100%'),
  body('rainfall').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Rainfall cannot be negative'),
  body('wind_speed').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Wind speed cannot be negative'),
  body('soil_moisture').optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage('Moisture must be 0-100%'),
  handleValidationErrors
];

module.exports = {
  soilObservationValidator,
  environmentalReadingValidator
};

