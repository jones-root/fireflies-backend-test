import { TaskStatus } from "../../task/task.model.js";

export interface GeneralAnalytics {
	totalMeetings: number;
	averageParticipants: number;
	totalParticipants: number;
	participantDiversity: number;
	shortestMeeting: number;
	longestMeeting: number;
	averageDuration: number;
	averageTranscriptLength: number;
	averageActionItems: number;
}

export interface TopParticipant {
	participant: string;
	meetingCount: number;
}

export interface MeetingsByTheOfWeek {
	dayOfWeek: number;
	count: number;
}

export interface GetAnalyticsResponseDto {
	generalStats: GeneralAnalytics;
	topParticipants: TopParticipant[];
	meetingsByDayOfWeek: MeetingsByTheOfWeek[];
	tasksStats: {
		distribution: {
			status: TaskStatus;
			count: number;
			percentage: number;
		}[];
	};
}
