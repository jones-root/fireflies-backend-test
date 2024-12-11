import express from "express";
import { AuthenticatedRequest } from "../user/auth.middleware";
import { dashboardController } from "./dashboard.controller";

const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res) => {
  const response = await dashboardController.getMyDashboard(req);
  res.json(response);
});

export { router as dashboardRoutes };
