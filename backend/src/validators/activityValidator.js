const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const activityValidator = [
  body('farm_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Farm ID required'),
  body('plot_id').notEmpty().isInt({ min: 1 }).withMessage('Valid Plot ID required'),
  body('activity_type')
    .notEmpty().withMessage('Activity type is required')
    .isIn(['Land Preparation', 'Sowing', 'Fertilization', 'Irrigation', 'Pest Control', 'Weeding', 'Pruning', 'Harvesting', 'Other'])
    .withMessage('Invalid activity type'),
  body('activity_date').notEmpty().isISO8601().withMessage('Activity date must be a valid date'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('labour_hours').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Labour hours cannot be negative'),
  body('cost').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Cost cannot be negative'),
  body('status')
    .optional()
    .isIn(['Planned', 'In Progress', 'Completed', 'Cancelled']).withMessage('Invalid status'),
  handleValidationErrors
];

module.exports = {
  activityValidator
};

