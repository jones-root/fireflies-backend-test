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

export const router = express.Router();

// GET all meetings for user
router.get("/", async (req: AuthenticatedRequest, res) => {
  const meetings = await Meeting.find({ userId: req.userId }, { __v: 0 });

  res.json({
    total: meetings.length,
    limit: req.query.limit,
    page: req.query.page,
    data: meetings,
  });
});

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
