import { Types } from "mongoose";

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
