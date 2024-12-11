import express from "express";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { validate } from "../_core/plugins/yup.js";
import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto";
import { taskRepository } from "./task.repository.js";

export const router = express.Router();

// GET all tasks from requesting user
// The query should be in the format ?json={"limit":0,"page":0}
router.get(
  "/",
  validate({ query: PaginationDto }),
  async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
    const tasks = await taskRepository.getAllByUserId(req.userId!, {
      page: req.parsedQuery?.page,
      limit: req.parsedQuery?.limit,
    });

    res.json({
      total: tasks.length,
      limit: req.parsedQuery!.limit,
      page: req.parsedQuery!.page,
      data: tasks,
    });
  }
);

export { router as taskRoutes };
