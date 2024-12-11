import { taskRepository } from "./task.repository";
import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto";
import { DEFAULT_PAGINATION_LIMIT } from "../constants";
import { AuthenticatedRequest } from "../user/auth.middleware";
import { IPaginationDto } from "../_core/dto/pagination.dto";

export const taskController = {
  async getMyTasks(
    req: AuthenticatedRequest<any, IPaginationDto>
  ): Promise<IPaginationResponseDto> {
    const tasks = await taskRepository.getAll(
      { userId: req.userId! },
      {
        page: req.parsedQuery?.page,
        limit: req.parsedQuery?.limit,
      }
    );

    return {
      total: tasks.length,
      limit: req.parsedQuery?.limit ?? DEFAULT_PAGINATION_LIMIT,
      page: req.parsedQuery?.page ?? 1,
      data: tasks,
    };
  },
};
