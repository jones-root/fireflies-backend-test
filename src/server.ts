// env vars must be loaded from a separate module because in ESModules modules are loaded and executed before any of the importing module code
import "./env.config.js";

import express from "express";
import { meetingRoutes } from "./routes/meetings.js";
import { taskRoutes } from "./routes/task.router.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { authMiddleware } from "./auth.middleware.js";
import { connectToMongoDB } from "./mongo.config.js";

// It should prevent app from starting if MongoDB connection fails
await connectToMongoDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the MeetingBot API" });
});

app.use("/api/meetings", authMiddleware, meetingRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
