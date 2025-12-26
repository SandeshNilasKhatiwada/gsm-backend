// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry",
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Not found handler
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
