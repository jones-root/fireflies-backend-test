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
  ISetMeetingTranscriptionDto,
  SetMeetingTranscriptionDto,
} from "./dto/set_meeting_transcription.dto.js";
import { llm } from "../_core/plugins/llm.js";
import { Task } from "../task/task.model.js";
import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto.js";

export const router = express.Router();

// GET all meetings for requesting user
// The query should be in the format ?json={"limit":0,"page":0}
router.get(
  "/",
  validate({ query: PaginationDto }),
  async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
    const meetings = await Meeting.find(
      { userId: req.userId },
      { __v: 0 },
      {
        sort: { date: -1 },
        skip: (req.parsedQuery!.page! - 1) * req.parsedQuery!.limit!,
        limit: req.parsedQuery!.limit,
      }
    );

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
    const meeting = await Meeting.findOne(
      { _id: req.params.id, userId: req.userId },
      { __v: 0 }
    );

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
  validate({ params: yupMongoId, body: SetMeetingTranscriptionDto }),
  async (
    req: AuthenticatedRequest<IYupMongoId, any, ISetMeetingTranscriptionDto>,
    res
  ) => {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { transcript: req.body.transcription } },
      { new: true }
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
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    const response = meeting.toObject({ versionKey: false }).toJSON();
    response.tasks = tasks.map((task) => task.toObject({ versionKey: false }));

    res.status(201).json(response);
  }
);

// TODO: implement other endpoints

router.get("/stats", async (req: AuthenticatedRequest, res) => {
  try {
    // TODO: get statistics from the database
    const stats = {
      generalStats: {
        totalMeetings: 100,
        averageParticipants: 4.75,
        totalParticipants: 475,
        shortestMeeting: 15,
        longestMeeting: 120,
        averageDuration: 45.3,
      },
      topParticipants: [
        { participant: "John Doe", meetingCount: 20 },
        { participant: "Jane Smith", meetingCount: 18 },
        { participant: "Bob Johnson", meetingCount: 15 },
        { participant: "Alice Brown", meetingCount: 12 },
        { participant: "Charlie Davis", meetingCount: 10 },
      ],
      meetingsByDayOfWeek: [
        { dayOfWeek: 1, count: 10 },
        { dayOfWeek: 2, count: 22 },
        { dayOfWeek: 3, count: 25 },
        { dayOfWeek: 4, count: 20 },
        { dayOfWeek: 5, count: 18 },
        { dayOfWeek: 6, count: 5 },
        { dayOfWeek: 7, count: 0 },
      ],
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export { router as meetingRoutes };
