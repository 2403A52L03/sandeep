
/**
 * Standardized API response formatters
 */

export const successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = null
) => {
  const response = {
    success: true,
    message,
    data: data !== null ? data : {}
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res,
  statusCode = 500,
  message = "An error occurred",
  errors = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};
