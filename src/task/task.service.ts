import { taskRepository } from "./task.repository.js";
import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto.js";
import { DEFAULT_PAGINATION_LIMIT } from "../constants.js";
import { IPaginationDto } from "../_core/dto/pagination.dto.js";

export const taskService = {
	async getTasksByUserId(userId: string, dto?: IPaginationDto): Promise<IPaginationResponseDto> {
		const tasks = await taskRepository.getAll(
			{ userId },
			{
				page: dto?.page,
				limit: dto?.limit,
			},
		);

		return {
			total: tasks.length,
			limit: dto?.limit ?? DEFAULT_PAGINATION_LIMIT,
			page: dto?.page ?? 1,
			data: tasks,
		};
	},
};
