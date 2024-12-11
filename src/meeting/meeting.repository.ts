import { IPaginationDto } from "../_core/dto/pagination.dto";
import { DEFAULT_PAGINATION_LIMIT } from "../constants";
import { IUpcomingMeeting } from "../dashboard/dto/get_dashboard_response.dto";
import { GeneralAnalytics, MeetingsByTheOfWeek, TopParticipant } from "./dto/get_analytics_response.dto";
import { IMeeting, Meeting } from "./meeting.model";

export const meetingRepository = {
	async insert(meeting: IMeeting) {
		return Meeting.create(meeting);
	},

	/** It's mapped to `findAndModify` in MongoDB. Only 1 query is performed. */
	async updateAndGet(criteria: Partial<IMeeting>, partial: Partial<IMeeting>) {
		const meeting = await Meeting.findOneAndUpdate(<any>criteria, { $set: partial }, { new: true });

		if (meeting) {
			return meeting.toObject({ versionKey: false });
		}

		return meeting;
	},

	async getById(id: string, options?: { userId?: string }) {
		return Meeting.findOne({ _id: id, userId: options?.userId }, { __v: 0 });
	},

	async getAllByUserId(
		userId: string,
		{ page, limit }: IPaginationDto = {
			page: 1,
			limit: DEFAULT_PAGINATION_LIMIT,
		},
	) {
		return Meeting.find(
			{ userId },
			{ __v: 0 },
			{
				sort: { date: -1 },
				skip: (page! - 1) * limit!,
				limit: limit,
			},
		);
	},

	async getDashboardByUserId(userId: string): Promise<{
		totalMeetings?: { count: number }[];
		upcomingMeetings?: IUpcomingMeeting[];
	}> {
		const now = new Date();
		const [result] = await Meeting.aggregate([
			{ $match: { userId } },
			{
				$facet: {
					totalMeetings: [{ $count: "count" }],
					upcomingMeetings: [
						// Return only meetings schedule to after now and meetings that didn't happened (where `transcript` is not set)
						{ $match: { date: { $gte: now }, transcript: { $in: [null, undefined] } } },
						{ $sort: { date: 1 } },
						{ $limit: 5 },
						{
							$project: {
								_id: 1,
								title: 1,
								date: 1,
								participantCount: { $size: "$participants" },
							},
						},
					],
				},
			},
		]);

		return result;
	},

	async getAnalyticsByUserId(userId: string): Promise<{
		generalStats?: Partial<GeneralAnalytics>[];
		topParticipants?: TopParticipant[];
		meetingsByDayOfWeek?: MeetingsByTheOfWeek[];
		distinctParticipants?: {
			distinctParticipants?: any[];
		}[];
	}> {
		const [result] = await Meeting.aggregate([
			{ $match: { userId } },
			{
				$project: {
					_id: 1,
					userId: 1,
					title: 1,
					date: 1,
					participants: 1,
					transcript: 1,
					summary: 1,
					actionItems: 1,
					duration: 1,
					transcriptLength: {
						// Only set transcripts are considered to calculate the average
						$cond: [{ $and: [{ $ifNull: ["$transcript", false] }] }, { $strLenCP: "$transcript" }, null],
					},
				},
			},
			{
				$facet: {
					generalStats: [
						{
							$group: {
								_id: null,
								totalMeetings: { $sum: 1 },
								totalParticipants: { $sum: { $size: "$participants" } },
								averageParticipants: { $avg: { $size: "$participants" } },
								shortestMeeting: { $min: "$duration" },
								longestMeeting: { $max: "$duration" },
								averageDuration: { $avg: "$duration" },
								averageTranscriptLength: { $avg: "$transcriptLength" },
								averageActionItems: { $avg: { $size: "$actionItems" } },
							},
						},
					],
					topParticipants: [
						{ $unwind: "$participants" },
						{
							$group: {
								_id: "$participants",
								meetingCount: { $sum: 1 },
							},
						},
						{ $project: { participant: "$_id", meetingCount: 1 } },
						{ $sort: { meetingCount: -1, participant: 1 } }, // Order by meeting count and then alphabetically by participant name
						{ $limit: 5 },
					],
					meetingsByDayOfWeek: [
						{
							$group: {
								_id: { $dayOfWeek: "$date" },
								count: { $sum: 1 },
							},
						},
						{
							$project: {
								dayOfWeek: "$_id",
								count: 1,
							},
						},
					],
					distinctParticipants: [
						{ $unwind: "$participants" },
						{
							$group: {
								_id: null,
								distinctParticipants: { $addToSet: "$participants" },
							},
						},
					],
				},
			},
		]);

		return result;
	},
};
