import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { IPaginationDto } from "../_core/dto/pagination.dto.js";
import { taskService } from "./task.service.js";

export const taskController = {
	async getMyTasks(req: AuthenticatedRequest<any, IPaginationDto>): Promise<IPaginationResponseDto> {
		return taskService.getTasksByUserId(req.userId!, req.parsedQuery);
	},
};
