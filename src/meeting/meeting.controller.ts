import httpErrors from "http-errors";
import { IMeeting, Meeting } from "./meeting.model.js";
import { llm } from "../_core/plugins/llm.js";
import { meetingRepository } from "./meeting.repository.js";
import { taskRepository } from "../task/task.repository.js";
import { GetAnalyticsResponseDto } from "./dto/get_analytics_response.dto.js";
import { DEFAULT_PAGINATION_LIMIT } from "../constants.js";
import { IPaginationResponseDto } from "../_core/dto/pagination_response.dto.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { IPaginationDto } from "../_core/dto/pagination.dto.js";
import { IYupMongoId } from "../_core/plugins/yup.js";
import { IUpdateEndedMeetingDto } from "./dto/update_ended_meeting.dto.js";
import { ICreateMeetingDto } from "./dto/create_meeting.dto.js";

export const meetingController = {
  async getMyAnalytics(
    req: AuthenticatedRequest
  ): Promise<GetAnalyticsResponseDto> {
    const [meetingsResult, tasksResult] = await Promise.all([
      meetingRepository.getAnalyticsByUserId(req.userId!),
      taskRepository.getAnalyticsByUserId(req.userId!),
    ]);

    const general = meetingsResult.generalStats?.[0] ?? {};
    const topParticipants = meetingsResult.topParticipants ?? [];
    const days = meetingsResult.meetingsByDayOfWeek ?? [];
    const { distinctParticipants } =
      meetingsResult.distinctParticipants?.[0] ?? {};
    const tasksDistribution = tasksResult.tasksDistribution ?? [];

    const participantDiversity = distinctParticipants?.length ?? 0;

    const meetingsByDayOfWeek = days
      .map((item) => ({
        dayOfWeek: item.dayOfWeek, // 1 - Sunday ... 7 - Saturday
        count: item.count,
      }))
      .sort((left, right) => left.dayOfWeek - right.dayOfWeek);

    const totalTasks = tasksDistribution.reduce(
      (total: number, current) => total + current.count,
      0
    );

    const taskStatusDistribution = tasksDistribution.map((item) => ({
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
      topParticipants: topParticipants.map((item) => ({
        participant: item.participant,
        meetingCount: item.meetingCount,
      })),
      meetingsByDayOfWeek,
      tasksStats: {
        distribution: taskStatusDistribution, // Task count and percentage by status
      },
    };
  },

  async getMyMeetings(
    req: AuthenticatedRequest<any, IPaginationDto>
  ): Promise<IPaginationResponseDto> {
    const meetings = await meetingRepository.getAllByUserId(req.userId!, {
      page: req.parsedQuery?.page,
      limit: req.parsedQuery?.limit,
    });

    return {
      total: meetings.length,
      limit: req.parsedQuery!.limit ?? DEFAULT_PAGINATION_LIMIT,
      page: req.parsedQuery!.page ?? 1,
      data: meetings,
    };
  },

  async getMyMeetingById(
    req: AuthenticatedRequest<IYupMongoId>
  ): Promise<IMeeting> {
    const meeting = await meetingRepository.getById(req.params.id, {
      userId: req.userId!,
    });

    if (!meeting) {
      throw new httpErrors.NotFound();
    }

    const response = meeting.toJSON();
    response.tasks = (
      await taskRepository.getAll({ meetingId: <any>req.params.id })
    ).map((item) => item.toJSON());

    return response;
  },

  async createMyMeeting(
    req: AuthenticatedRequest<any, any, ICreateMeetingDto>
  ): Promise<IMeeting> {
    const meeting = new Meeting({ ...req.body, userId: req.userId });
    const result = await meetingRepository.insert(meeting);

    return result.toObject({ versionKey: false });
  },

  async updateMyEndedMeeting(
    req: AuthenticatedRequest<IYupMongoId, any, IUpdateEndedMeetingDto>
  ): Promise<IMeeting> {
    const meeting = await meetingRepository.updateAndGet(
      { id: req.params.id, userId: req.userId! },
      { transcript: req.body.transcript, duration: req.body.duration }
    );

    if (!meeting) {
      throw new httpErrors.NotFound();
    }

    return meeting;
  },

  async generateMyMeetingSummary(req: AuthenticatedRequest): Promise<IMeeting> {
    const meeting = await meetingRepository.getById(req.params.id, {
      userId: req.userId!,
    });

    if (!meeting) {
      throw new httpErrors.NotFound();
    }

    if (!meeting.transcript) {
      throw new httpErrors.BadRequest(
        "The transcription for this meeting is not ready."
      );
    }

    const { summary, tasks } = await llm.summarizeMeeting(req.userId!, meeting);
    meeting.summary = summary;
    meeting.actionItems = tasks.map(({ title }) => title);

    // TODO Use single mongodb replica to allow transactions
    await meeting.updateOne({
      summary: meeting.summary,
      actionItems: meeting.actionItems,
    });

    await taskRepository.insertMany(tasks);

    const response = meeting.toObject({ versionKey: false });
    response.tasks = tasks.map((task) => task.toObject({ versionKey: false }));

    return response;
  },
};
