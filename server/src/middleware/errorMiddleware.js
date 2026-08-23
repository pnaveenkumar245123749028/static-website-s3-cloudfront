export function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]', err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode || 500);
  let code = err.code || 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'VALIDATION_ERROR',
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed or token expired.',
      code: 'AUTH_EXPIRED',
    });
  }

  if (err.message?.includes('INTEGRATION_NOT_CONNECTED')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: 'INTEGRATION_NOT_CONNECTED',
    });
  }

  if (err.message?.includes('AUTH_EXPIRED')) {
    return res.status(401).json({
      success: false,
      error: err.message,
      code: 'AUTH_EXPIRED',
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected server error occurred',
    code,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
