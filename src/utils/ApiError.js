export class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg = "Bad request", details) {
        return new ApiError(400, msg, details);
    }
    static notFound(msg = "Not found") {
        return new ApiError(404, msg);
    }
    static conflict(msg = "Conflict") {
        return new ApiError(409, msg);
    }
    static tooMany(msg = "Too many requests") {
        return new ApiError(429, msg);
    }
}