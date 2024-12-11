import { IPaginationDto } from "../_core/dto/pagination.dto";
import { Task } from "./task.model";

export const taskRepository = {
  async getAllByUserId(
    userId: string,
    { page, limit }: IPaginationDto = { page: 1, limit: 36 }
  ) {
    return Task.find(
      { userId },
      { __v: 0 },
      {
        sort: { date: -1 },
        skip: (page! - 1) * limit!,
        limit: limit,
      }
    );
  },

  async getAnalyticsByUserId(userId: string) {
    const [tasksResult] = await Task.aggregate([
      { $match: { userId } },
      {
        $facet: {
          tasksStats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                status: "$_id",
                count: 1,
              },
            },
          ],
        },
      },
    ]);

    return tasksResult;
  },
};
