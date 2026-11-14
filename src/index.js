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
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 50 }));
app.use("/api/tasks", routes);

connectDB(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
    })
    .catch((error) => {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    });


