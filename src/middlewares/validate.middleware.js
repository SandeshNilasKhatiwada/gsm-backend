// Zod validation middleware
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors?.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
  };
};
