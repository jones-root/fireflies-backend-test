import express from "express";
import { Meeting } from "./meeting.model.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { IYupMongoId, validate, yupMongoId } from "../_core/plugins/yup.js";
import {
  CreateMeetingDto,
  ICreateMeetingDto,
} from "./dto/create_meeting.dto.js";
import httpErrors from "http-errors";
import {
  IUpdateEndedMeetingDto,
  UpdateEndedMeetingDto,
} from "./dto/update_ended_meeting.dto.js";
import { llm } from "../_core/plugins/llm.js";
import { Task } from "../task/task.model.js";
import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto.js";
import { meetingRepository } from "./meeting.repository.js";
import { taskRepository } from "../task/task.repository.js";

export const router = express.Router();

// GET return statistics about meetings
router.get("/stats", async (req: AuthenticatedRequest, res, next) => {
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
    .map((item: any) => ({
      dayOfWeek: item.dayOfWeek, // 1 - Sunday ... 7 - Saturday
      count: item.count,
    }))
    .sort((left: any, right: any) => left.dayOfWeek - right.dayOfWeek);

  const totalTasks = tasksDistribution.reduce(
    (total: number, current: any) => total + current.count,
    0
  );

  const taskStatusDistribution = tasksDistribution.map((item: any) => ({
    status: item.status,
    count: item.count,
    percentage: item.count / totalTasks,
  }));

  const response = {
    generalStats: {
      totalMeetings: general.totalMeetings ?? 0,
      averageParticipants: general.averageParticipants ?? 0,
      totalParticipants: general.totalParticipants ?? 0,
      participantDiversity: participantDiversity ?? 0, // Total of unique participants
      shortestMeeting: general.shortestMeeting ?? 0,
      longestMeeting: general.longestMeeting ?? 0,
      averageDuration: general.averageDuration ?? 0,
      averageTranscriptLength: general.averageTranscriptLength ?? 0,
      averageActionItems: general.averageActionItems ?? 0, // Equivalent to total number os tasks
    },
    topParticipants: topParticipants.map((item: any) => ({
      participant: item.name,
      meetingCount: item.meetingCount,
    })),
    meetingsByDayOfWeek,
    tasksStats: {
      distribution: taskStatusDistribution, // Count of tasks with a specific status
    },
  };

  res.json(response);
});

// GET all meetings for requesting user
// The query should be in the format ?json={"limit":0,"page":0}
router.get(
  "/",
  validate({ query: PaginationDto }),
  async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
    const meetings = await meetingRepository.getAllByUserId(req.userId!, {
      page: req.parsedQuery?.page,
      limit: req.parsedQuery?.limit,
    });

    res.json({
      total: meetings.length,
      limit: req.parsedQuery!.limit,
      page: req.parsedQuery!.page,
      data: meetings,
    });
  }
);

// GET Retrieve single meeting
router.get(
  "/:id",
  validate({ params: yupMongoId }),
  async (req: AuthenticatedRequest<IYupMongoId>, res) => {
    const meeting = await meetingRepository.getById(req.params.id, {
      userId: req.userId!,
    });

    if (!meeting) {
      throw new httpErrors.NotFound();
    }

    const response = meeting.toJSON();
    response.tasks = await Task.find({ meetingId: req.params.id }, { __v: 0 });

    res.json(response);
  }
);

// POST create a meeting
router.post(
  "/",
  validate({ body: CreateMeetingDto }),
  async (req: AuthenticatedRequest<any, any, ICreateMeetingDto>, res) => {
    const meeting = new Meeting({ ...req.body, userId: req.userId });
    const result = await Meeting.create(meeting);

    res.status(201).json(result.toObject({ versionKey: false }));
  }
);

// PUT Update a meeting with its transcript.
router.put(
  "/:id/transcript",
  validate({ params: yupMongoId, body: UpdateEndedMeetingDto }),
  async (
    req: AuthenticatedRequest<IYupMongoId, any, IUpdateEndedMeetingDto>,
    res
  ) => {
    const meeting = await meetingRepository.updateAndGet(
      { id: req.params.id, userId: req.userId! },
      { transcript: req.body.transcript, duration: req.body.duration }
    );

    if (!meeting) {
      throw new httpErrors.NotFound();
    }

    res.status(201).json(meeting);
  }
);

// POST Generate summary, action items and tasks for a meeting
router.post(
  "/:id/summarize",
  validate({ params: yupMongoId }),
  async (req: AuthenticatedRequest, res) => {
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

    await Task.insertMany(tasks);

    const response = meeting.toObject({ versionKey: false });
    response.tasks = tasks.map((task) => task.toObject({ versionKey: false }));

    res.status(201).json(response);
  }
);

export default router;

export { router as meetingRoutes };
