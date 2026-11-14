import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export async function connectDB(uri) {
    if (!uri) {
        throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
    });

    logger.info("MongoDB connected", { db: mongoose.connection.name });
}