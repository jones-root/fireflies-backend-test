import express from "express";
import { Task } from "./task.model.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { validate } from "../_core/plugins/yup.js";
import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto";

export const router = express.Router();

// GET all tasks from requesting user
router.get(
  "/",
  validate({ query: PaginationDto }),
  async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
    const tasks = await Task.find(
      { userId: req.userId },
      { __v: 0 },
      {
        sort: { dueDate: -1 },
        skip: (req.parsedQuery!.page! - 1) * req.parsedQuery!.limit!,
        limit: req.parsedQuery!.limit,
      }
    );

    res.json({
      total: tasks.length,
      limit: req.parsedQuery!.limit,
      page: req.parsedQuery!.page,
      data: tasks,
    });
  }
);

export { router as taskRoutes };
