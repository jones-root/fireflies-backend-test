// Env vars must be loaded from a separate module because in ESModules modules are loaded and executed before any of the importing module code
import "./_core/plugins/env.config.js";

// Directly calls next() on async errors preventing the need for manual try/catch in endpoints
import "express-async-errors";

import express from "express";
import cors, { CorsOptions } from "cors";
import httpErrors from "http-errors";

import { meetingRoutes } from "./meeting/meeting.routes.js";
import { taskRoutes } from "./task/task.routes.js";
import { dashboardRoutes } from "./dashboard/dashboard.routes.js";
import { authMiddleware } from "./user/auth.middleware.js";
import { connectToMongoDB } from "./_core/plugins/mongo.config.js";
import { globalErrorHandler } from "./_core/plugins/global_error_handler.js";
import { IS_DEV } from "./constants.js";

// It should prevent app from starting if MongoDB connection fails
await connectToMongoDB();

const app = express();

app.use(express.json());

// Enable CORS
const corsWhitelist = process.env.CORS_WHITELIST?.split(",") ?? [];
const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		// Allow requests without origin during development
		if ((IS_DEV && !origin) || corsWhitelist.includes(origin!)) {
			callback(null, true);
		} else {
			callback(new httpErrors.Forbidden("Not allowed by CORS"));
		}
	},
	maxAge: 1800, // Keep preflight info for 30 mins
	credentials: true,
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
	res.json({ message: "Welcome to the MeetingBot API" });
});

app.use("/api/meetings", authMiddleware, meetingRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
