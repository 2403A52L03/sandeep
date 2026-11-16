const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const cropValidator = [
  body('plot_id')
    .notEmpty().withMessage('Plot ID is required')
    .isInt({ min: 1 }).withMessage('Valid Plot ID must be provided'),
  body('crop_name')
    .trim()
    .notEmpty().withMessage('Crop name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Crop name must be between 1 and 150 characters'),
  body('crop_category')
    .optional({ checkFalsy: true })
    .trim(),
  body('variety')
    .optional({ checkFalsy: true })
    .trim(),
  body('planting_date')
    .notEmpty().withMessage('Planting date is required')
    .isISO8601().withMessage('Planting date must be a valid date (YYYY-MM-DD)'),
  body('expected_harvest_date')
    .notEmpty().withMessage('Expected harvest date is required')
    .isISO8601().withMessage('Expected harvest date must be a valid date (YYYY-MM-DD)')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.planting_date)) {
        throw new Error('Expected harvest date must be after planting date');
      }
      return true;
    }),
  body('cultivated_area')
    .notEmpty().withMessage('Cultivated area is required')
    .isFloat({ min: 0.01 }).withMessage('Cultivated area must be a positive number greater than 0'),
  body('expected_yield')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Expected yield cannot be negative'),
  body('actual_yield')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Actual yield cannot be negative'),
  body('status')
    .optional()
    .isIn(['Planned', 'Planted', 'Growing', 'Flowering', 'Maturing', 'Ready for Harvest', 'Harvested', 'Failed'])
    .withMessage('Invalid crop status specified'),
  handleValidationErrors
];

module.exports = {
  cropValidator
};

