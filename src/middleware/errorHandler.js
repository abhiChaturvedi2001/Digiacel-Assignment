import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

/** Unknown routes: JSON 404 instead of Express's HTML page. */
export const notFound = (req, res, next) => {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/** Every error leaves the API as { success: false, message, details? }. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let status = 500;
    let message = "Something went wrong";
    let details;

    if (err instanceof ApiError) {
        ({ status, message, details } = err);
    } else if (err instanceof mongoose.Error.CastError) {
        status = 400;
        message = `Invalid value for ${err.path}`;
    } else if (err instanceof mongoose.Error.ValidationError) {
        status = 400;
        message = Object.values(err.errors)[0]?.message || "Validation failed";
    } else if (err.type === "entity.parse.failed") {
        status = 400;
        message = "Request body is not valid JSON";
    } else if (err.type === "entity.too.large") {
        status = 413;
        message = "Request body is too large";
    }

    if (status >= 500) {
        logger.error(`${req.method} ${req.originalUrl} failed: ${err.stack || err.message}`);
    }

    res.status(status).json({ success: false, message, ...(details && { details }) });
};
