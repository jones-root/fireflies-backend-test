import httpErrors from "http-errors";
import { IMeeting, Meeting } from "./meeting.model.js";
import { llm } from "../_core/plugins/llm.js";
import { meetingRepository } from "./meeting.repository.js";
import { taskRepository } from "../task/task.repository.js";
import { GetAnalyticsResponseDto } from "./dto/get_analytics_response.dto.js";
import { DEFAULT_PAGINATION_LIMIT } from "../constants.js";
import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto.js";
import { IPaginationDto } from "../_core/dto/pagination.dto.js";
import { IUpdateEndedMeetingDto } from "./dto/update_ended_meeting.dto.js";
import { ICreateMeetingDto } from "./dto/create_meeting.dto.js";

export const meetingService = {
	async getAnalyticsByUserId(userId: string): Promise<GetAnalyticsResponseDto> {
		const [meetingsResult, tasksResult] = await Promise.all([
			meetingRepository.getAnalyticsByUserId(userId),
			taskRepository.getAnalyticsByUserId(userId),
		]);

		const general = meetingsResult.generalStats?.[0] ?? {};
		const topParticipants = meetingsResult.topParticipants ?? [];
		const meetingsByDayOfWeek = meetingsResult.meetingsByDayOfWeek ?? [];
		const { distinctParticipants } = meetingsResult.distinctParticipants?.[0] ?? {};
		const tasksDistribution = tasksResult.tasksDistribution ?? [];

		const participantDiversity = distinctParticipants?.length ?? 0;
		const totalTasks = tasksDistribution.reduce((total: number, current) => total + current.count, 0);

		const taskStatusDistribution = tasksDistribution.map(item => ({
			status: item.status,
			count: item.count,
			percentage: item.count / totalTasks,
		}));

		return {
			generalStats: {
				totalMeetings: general.totalMeetings ?? 0,
				averageParticipants: general.averageParticipants ?? 0,
				totalParticipants: general.totalParticipants ?? 0,
				participantDiversity: participantDiversity ?? 0, // Total of unique participants
				shortestMeeting: general.shortestMeeting ?? 0,
				longestMeeting: general.longestMeeting ?? 0,
				averageDuration: general.averageDuration ?? 0,
				averageTranscriptLength: general.averageTranscriptLength ?? 0,
				averageActionItems: general.averageActionItems ?? 0, // Equivalent to number os tasks
			},
			topParticipants: topParticipants,
			meetingsByDayOfWeek,
			tasksStats: {
				distribution: taskStatusDistribution, // Task count and percentage by status
			},
		};
	},

	async getMeetingsByUserId(userId: string, dto?: IPaginationDto): Promise<IPaginationResponseDto> {
		const meetings = await meetingRepository.getAllByUserId(userId, {
			page: dto?.page,
			limit: dto?.limit,
		});

		return {
			total: meetings.length,
			limit: dto?.limit ?? DEFAULT_PAGINATION_LIMIT,
			page: dto?.page ?? 1,
			data: meetings,
		};
	},

	async getMeetingByIdAndUserId(id: string, userId: string): Promise<IMeeting> {
		const meeting = await meetingRepository.getById(id, { userId });

		if (!meeting) {
			throw new httpErrors.NotFound();
		}

		const response = meeting.toJSON();
		response.tasks = (await taskRepository.getAll({ meetingId: <any>id })).map(item => item.toJSON());

		return response;
	},

	async createMeetingToUser(userId: string, dto: ICreateMeetingDto): Promise<IMeeting> {
		const meeting = new Meeting({ ...dto, userId });
		const result = await meetingRepository.insert(meeting);

		return result.toObject({ versionKey: false });
	},

	async updateEndedMeetingByIdAndUserId(id: string, userId: string, dto: IUpdateEndedMeetingDto): Promise<IMeeting> {
		const meeting = await meetingRepository.updateAndGet(
			{ _id: <any>id, userId },
			{ transcript: dto.transcript, duration: dto.duration },
		);

		if (!meeting) {
			throw new httpErrors.NotFound();
		}

		return meeting;
	},

	async generateMeetingSummaryByIdAndUserId(id: string, userId: string): Promise<IMeeting> {
		const meeting = await meetingRepository.getById(id, { userId });

		if (!meeting) {
			throw new httpErrors.NotFound();
		}

		if (!meeting.transcript) {
			throw new httpErrors.BadRequest("The transcription for this meeting is not ready.");
		}

		const { summary, tasks } = await llm.summarizeMeeting(userId, meeting);
		meeting.summary = summary;
		meeting.actionItems = tasks.map(({ title }) => title);

		// TODO Use single mongodb replica to allow transactions
		await meeting.updateOne({
			summary: meeting.summary,
			actionItems: meeting.actionItems,
		});

		await taskRepository.insertMany(tasks);

		const response = meeting.toObject({ versionKey: false });
		response.tasks = tasks.map(task => task.toObject({ versionKey: false }));

		return response;
	},
};
