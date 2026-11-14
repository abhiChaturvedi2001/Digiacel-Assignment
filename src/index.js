import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import routes from "./routes/taskRoutes.js";

// creating the server instance
const app = express();
app.set("trust proxy", 1);

const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running"
    });
});

app.use(async (req, res, next) => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not configured");
        }

        await connectDB(MONGO_URI);
        next();
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);

        res.status(503).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.use("/api", rateLimit({ windowMs: 60_000, limit: 50 }));
app.use("/api/tasks", routes);

export default app;


