export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  const status = err.status || 500
  const message = err.message || "Internal Server Error"

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  })
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
