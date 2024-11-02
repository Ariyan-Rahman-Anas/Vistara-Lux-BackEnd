export const errorHandler = (err, req, res, next) => {
    err.message || (err.message = "");
    return res.status(400).json({
        success: false,
        error: err.message
    });
};
