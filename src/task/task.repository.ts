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

  async getDashboardByUserId(userId: string) {
    const now = new Date();

    const [result] = await Task.aggregate([
      { $match: { userId } },
      {
        $facet: {
          tasksDistribution: this._tasksDistributionAggregation,
          overdueTasks: [
            {
              $lookup: {
                from: "meetings",
                localField: "meetingId",
                foreignField: "_id",
                as: "meeting",
              },
            },
            {
              $match: {
                dueDate: { $lt: now },
                status: { $ne: "completed" },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                dueDate: 1,
                meetingId: 1,
                meetingTitle: { $arrayElemAt: ["$meeting.title", 0] },
              },
            },
          ],
        },
      },
    ]);

    return result;
  },

  async getAnalyticsByUserId(userId: string) {
    const [result] = await Task.aggregate([
      { $match: { userId } },
      { $facet: { tasksDistribution: this._tasksDistributionAggregation } },
    ]);

    return result;
  },

  get _tasksDistributionAggregation() {
    return [
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
    ];
  },
};
