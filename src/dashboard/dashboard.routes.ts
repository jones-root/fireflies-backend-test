import express from "express";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res) => {
	const response = await dashboardController.getMyDashboard(req);
	res.json(response);
});

export { router as dashboardRoutes };
