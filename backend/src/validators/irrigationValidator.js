const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const irrigationValidator = [
  body('farm_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Farm ID required'),
  body('plot_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Plot ID required'),
  body('irrigation_method')
    .notEmpty().withMessage('Irrigation method is required')
    .isIn(['Drip', 'Sprinkler', 'Surface', 'Manual']).withMessage('Method must be Drip, Sprinkler, Surface, or Manual'),
  body('scheduled_date').notEmpty().isISO8601().withMessage('Scheduled date must be a valid date'),
  body('duration_minutes').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Duration must be positive minutes'),
  body('water_quantity_litres').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Water quantity cannot be negative'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid irrigation status'),
  handleValidationErrors
];

module.exports = {
  irrigationValidator
};

