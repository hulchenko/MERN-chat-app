export const errorHandler = (err, req, res, next) => {
  console.error("Error handler: ", err.message);

  const statusCode = err.status || 500;
  const errMessage = err.message || "Internal server error.";

  return res.status(statusCode).json({ error: true, message: errMessage });
};
