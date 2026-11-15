import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

let connecting = null;

/**
 * Connects once and reuses the connection. Safe to call on every request
 * (serverless): an open connection returns immediately and parallel callers
 * share a single in-flight attempt. A failed attempt is cleared so the next call retries.
 */
export async function connectDB(uri) {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!connecting) {
        connecting = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
            .then((m) => {
                logger.info(`MongoDB connected (db: ${m.connection.name})`);
                return m.connection;
            })
            .catch((error) => {
                connecting = null;
                throw error;
            });
    }

    return connecting;
}
