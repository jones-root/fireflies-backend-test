import { Types } from "mongoose";
import { TaskStatus } from "../../task/task.model";

export interface IUpcomingMeeting {
	_id: Types.ObjectId;
	title: string;
	date: Date;
	participantCount: number;
}

export interface IOverdueTask {
	_id: Types.ObjectId;
	title: string;
	dueDate: Date;
	status: TaskStatus;
	meetingId: Types.ObjectId;
	meetingTitle: string;
}

export interface IDashboardDataDto {
	totalMeetings: number;
	taskSummary: {
		pending: number;
		inProgress: number;
		completed: number;
	};
	upcomingMeetings: IUpcomingMeeting[];
	overdueTasks: IOverdueTask[];
}
