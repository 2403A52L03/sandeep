const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const plotValidator = [
  body('farm_id')
    .notEmpty().withMessage('Farm ID is required')
    .isInt({ min: 1 }).withMessage('Valid Farm ID must be provided'),
  body('name')
    .trim()
    .notEmpty().withMessage('Plot name is required')
    .isLength({ min: 1, max: 150 }).withMessage('Plot name must be between 1 and 150 characters'),
  body('area')
    .notEmpty().withMessage('Plot area is required')
    .isFloat({ min: 0.01 }).withMessage('Plot area must be a positive number greater than 0'),
  body('soil_type')
    .optional({ checkFalsy: true })
    .trim(),
  body('irrigation_type')
    .optional({ checkFalsy: true })
    .trim(),
  handleValidationErrors
];

module.exports = {
  plotValidator
};
