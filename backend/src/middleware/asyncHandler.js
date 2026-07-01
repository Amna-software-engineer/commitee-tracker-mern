// Express doesn't automatically catch rejected promises from async route
// handlers. Wrapping every controller in this saves writing a try/catch
// in each one - any thrown error, or rejected promise, gets forwarded to
// the errorHandler middleware in server.js via next(err).
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
