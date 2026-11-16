
import { body, validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      400,
      "Validation failed",
      errors.array().map((e) => e.msg)
    );
  }

  next();
};

export const registerValidator = [
  body("full_name")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("Phone number must be between 8 and 20 digits"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword").custom((val, { req }) => {
    if (val !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  body("role")
    .optional()
    .isIn(["farmer", "officer", "agronomist"])
    .withMessage("Invalid role specified. Self-registration as Admin is prohibited."),

  handleValidationErrors
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail().withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  handleValidationErrors
];
