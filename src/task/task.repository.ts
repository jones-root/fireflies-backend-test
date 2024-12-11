import { IPaginationDto } from "../_core/dto/pagination.dto";
import { ITask, Task, TaskStatus } from "./task.model";
import { IOverdueTask } from "../dashboard/dto/get_dashboard_response.dto";
import { DEFAULT_PAGINATION_LIMIT } from "../constants";

export interface ITaskStatusCount {
	status: TaskStatus;
	count: number;
}

export const taskRepository = {
	async insertMany(tasks: ITask[]) {
		return Task.insertMany(tasks);
	},

	async getAll(
		criteria: Partial<ITask>,
		{ page, limit }: IPaginationDto = {
			page: 1,
			limit: DEFAULT_PAGINATION_LIMIT,
		},
	) {
		return Task.find(
			<any>criteria,
			{ __v: 0 },
			{
				sort: { date: -1 },
				skip: (page! - 1) * limit!,
				limit: limit,
			},
		);
	},

	async getDashboardByUserId(userId: string): Promise<{
		tasksDistribution?: ITaskStatusCount[];
		overdueTasks?: IOverdueTask[];
	}> {
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
								status: 1,
								meetingTitle: { $arrayElemAt: ["$meeting.title", 0] }, // It should always return 1 meeting from $lookup
							},
						},
					],
				},
			},
		]);

		return result;
	},

	async getAnalyticsByUserId(userId: string): Promise<{ tasksDistribution?: ITaskStatusCount[] }> {
		const [result] = await Task.aggregate([
			{ $match: { userId } },
			{ $facet: { tasksDistribution: this._tasksDistributionAggregation } },
		]);

		return result;
	},

	/** Reusable MongoDB aggregation to retrieve distribution of tasks  */
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
