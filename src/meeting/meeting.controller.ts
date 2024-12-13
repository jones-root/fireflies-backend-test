import { IMeeting } from "./meeting.model.js";
import { GetAnalyticsResponseDto } from "./dto/get_analytics_response.dto.js";
import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { IPaginationDto } from "../_core/dto/pagination.dto.js";
import { IYupMongoId } from "../_core/plugins/yup.js";
import { IUpdateEndedMeetingDto } from "./dto/update_ended_meeting.dto.js";
import { ICreateMeetingDto } from "./dto/create_meeting.dto.js";
import { meetingService } from "./meeting.service.js";

export const meetingController = {
	async getMyAnalytics(req: AuthenticatedRequest): Promise<GetAnalyticsResponseDto> {
		return meetingService.getAnalyticsByUserId(req.userId!);
	},

	async getMyMeetings(req: AuthenticatedRequest<any, IPaginationDto>): Promise<IPaginationResponseDto> {
		return meetingService.getMeetingsByUserId(req.userId!, req.parsedQuery);
	},

	async getMyMeetingById(req: AuthenticatedRequest<IYupMongoId>): Promise<IMeeting> {
		return meetingService.getMeetingByIdAndUserId(req.params.id, req.userId!);
	},

	async createMyMeeting(req: AuthenticatedRequest<any, any, ICreateMeetingDto>): Promise<IMeeting> {
		return meetingService.createMeetingToUser(req.userId!, req.body);
	},

	/**
	 * This endpoint flags a meeting as over, even if it was primarily scheduled for a point in the past or in the future.
	 *  */
	async updateMyEndedMeeting(req: AuthenticatedRequest<IYupMongoId, any, IUpdateEndedMeetingDto>): Promise<IMeeting> {
		return meetingService.updateEndedMeetingByIdAndUserId(req.params.id, req.userId!, req.body);
	},

	async generateMyMeetingSummary(req: AuthenticatedRequest): Promise<IMeeting> {
		return meetingService.generateMeetingSummaryByIdAndUserId(req.params.id, req.userId!);
	},
};
