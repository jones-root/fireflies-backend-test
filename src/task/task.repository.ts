import { Task } from "./task.model";

export const taskRepository = {
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
