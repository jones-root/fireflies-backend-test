import express from "express";
import { AuthenticatedRequest } from "../user/auth.middleware";
import { validate } from "../_core/plugins/yup";
import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto";
import { taskController } from "./task.controller";

export const router = express.Router();

// GET all tasks from requesting user
// The query should be in the format ?json={"limit":0,"page":0}
router.get("/", validate({ query: PaginationDto }), async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
	const response = await taskController.getMyTasks(req);
	res.json(response);
});

export { router as taskRoutes };
