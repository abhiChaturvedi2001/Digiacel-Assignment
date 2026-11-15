import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import routes from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const MONGO_URI = process.env.MONGO_URI;
const PORT = Number(process.env.PORT) || 8081;

// CLIENT_ORIGIN may list several origins, comma-separated. When it is not set,
// cross-origin requests are refused rather than silently allowed from anywhere.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

if (!MONGO_URI) logger.warn("MONGO_URI is not set: API requests will fail with 503");
if (!allowedOrigins.length) logger.warn("CLIENT_ORIGIN is not set: cross-origin requests will be refused");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Health check (no database needed)
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Backend is running" });
});

// Rate limit first, so rejected requests never touch the database.
app.use("/api", rateLimit({ windowMs: 60_000, limit: 50, standardHeaders: "draft-8", legacyHeaders: false }));

app.use("/api", async (req, res, next) => {
    try {
        if (!MONGO_URI) throw new Error("MONGO_URI is not configured");
        await connectDB(MONGO_URI);
        next();
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);
        res.status(503).json({ success: false, message: "Database connection failed" });
    }
});

app.use("/api/tasks", routes);

app.use(notFound);
app.use(errorHandler);

// On Vercel the platform invokes the exported app; everywhere else, start a server.
if (!process.env.VERCEL) {
    app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
}

export default app;
