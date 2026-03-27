function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = status >= 500 ? 'Server error' : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };

