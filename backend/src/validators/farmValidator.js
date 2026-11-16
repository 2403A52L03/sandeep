const { body } = require('express-validator');
const { handleValidationErrors } = require('./authValidator');

const farmValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Farm name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Farm name must be between 2 and 200 characters'),
  body('total_area')
    .notEmpty().withMessage('Total area is required')
    .isFloat({ min: 0.01 }).withMessage('Total area must be a positive number greater than 0'),
  body('area_unit')
    .optional()
    .isIn(['Acres', 'Hectares', 'Guntas']).withMessage('Area unit must be Acres, Hectares, or Guntas'),
  body('soil_type')
    .optional({ checkFalsy: true })
    .trim(),
  body('location')
    .optional({ checkFalsy: true })
    .trim(),
  body('village')
    .optional({ checkFalsy: true })
    .trim(),
  body('district')
    .optional({ checkFalsy: true })
    .trim(),
  body('state')
    .optional({ checkFalsy: true })
    .trim(),
  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  handleValidationErrors
];

module.exports = {
  farmValidator
};

