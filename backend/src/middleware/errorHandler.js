// Runs when no route matched the request - turns it into a 404 error object
// that flows into errorHandler below.
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found - ${req.method} ${req.originalUrl}`));
}

// Must be registered last (after all routes) - Express recognizes it as an
// error handler because it takes 4 arguments.
export function errorHandler(err, req, res, next) {
  // If a controller threw without explicitly setting a status, default to 500.
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Mongoose validation errors (e.g. a required field missing) are more
  // useful to the client as a 400 with each field's message.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate unique-index error (e.g. two members with the same name).
  if (err.code === 11000) {
    return res.status(409).json({
      message: `Duplicate value for: ${Object.keys(err.keyValue).join(", ")}`,
    });
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
