// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    statusCode: 500
  };

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error = {
      success: false,
      message: 'Duplicate entry - resource already exists',
      statusCode: 409
    };
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = {
      success: false,
      message: 'Referenced resource not found',
      statusCode: 400
    };
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    error = {
      success: false,
      message: 'Cannot delete - resource is being used',
      statusCode: 400
    };
  } else if (err.code === 'ER_BAD_FIELD_ERROR') {
    error = {
      success: false,
      message: 'Invalid field in request',
      statusCode: 400
    };
  } else if (err.code === 'ER_DATA_TOO_LONG') {
    error = {
      success: false,
      message: 'Data too long for field',
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      statusCode: 401
    };
  } else if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      statusCode: 401
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Validation error',
      statusCode: 400,
      errors: err.details || err.message
    };
  }

  // Custom application errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Internal Server Error';
  }

  res.status(error.statusCode).json({
    success: error.success,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
const validationError = (message, details = null) => {
  const error = new Error(message);
  error.statusCode = 400;
  error.details = details;
  return error;
};

// Not found error handler
const notFoundError = (resource = 'Resource') => {
  const error = new Error(`${resource} not found`);
  error.statusCode = 404;
  return error;
};

// Unauthorized error handler
const unauthorizedError = (message = 'Unauthorized access') => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

// Forbidden error handler
const forbiddenError = (message = 'Access forbidden') => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

// Conflict error handler
const conflictError = (message = 'Resource conflict') => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  conflictError
};

