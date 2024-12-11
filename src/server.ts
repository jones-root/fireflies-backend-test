// Env vars must be loaded from a separate module because in ESModules modules are loaded and executed before any of the importing module code
import "./_core/plugins/env.config.js";

// Directly calls next() on async errors preventing the need for manual try/catch
import "express-async-errors";

import express from "express";
import { meetingRoutes } from "./meeting/meetings.routes.js";
import { taskRoutes } from "./task/task.routes.js";
import { dashboardRoutes } from "./dashboard/dashboard.routes.js";
import { authMiddleware } from "./user/auth.middleware.js";
import { connectToMongoDB } from "./_core/plugins/mongo.config.js";
import { globalErrorHandler } from "./_core/plugins/global_error_handler.js";

// It should prevent app from starting if MongoDB connection fails
await connectToMongoDB();

const app = express();

app.use(express.json());

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
