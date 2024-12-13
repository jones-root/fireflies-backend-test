import express from "express";

import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { IYupMongoId, validate, yupMongoId } from "../_core/plugins/yup.js";
import { CreateMeetingDto, ICreateMeetingDto } from "./dto/create_meeting.dto.js";

import { IUpdateEndedMeetingDto, UpdateEndedMeetingDto } from "./dto/update_ended_meeting.dto.js";

import { IPaginationDto, PaginationDto } from "../_core/dto/pagination.dto.js";

import { meetingController } from "./meeting.controller.js";

export const router = express.Router();

// GET return statistics about meetings
router.get("/stats", async (req: AuthenticatedRequest, res) => {
	const response = await meetingController.getMyAnalytics(req);
	res.json(response);
});

// GET all meetings for requesting user
// The query should be in the format ?json={"limit":0,"page":0}
router.get("/", validate({ query: PaginationDto }), async (req: AuthenticatedRequest<any, IPaginationDto>, res) => {
	const response = await meetingController.getMyMeetings(req);
	res.json(response);
});

// GET Retrieve single meeting
router.get("/:id", validate({ params: yupMongoId }), async (req: AuthenticatedRequest<IYupMongoId>, res) => {
	const response = await meetingController.getMyMeetingById(req);
	res.json(response);
});

// POST create a meeting
router.post(
	"/",
	validate({ body: CreateMeetingDto }),
	async (req: AuthenticatedRequest<any, any, ICreateMeetingDto>, res) => {
		const response = await meetingController.createMyMeeting(req);
		res.status(201).json(response);
	},
);

// PUT Update a meeting with its transcript.
router.put(
	"/:id/transcript",
	validate({ params: yupMongoId, body: UpdateEndedMeetingDto }),
	async (req: AuthenticatedRequest<IYupMongoId, any, IUpdateEndedMeetingDto>, res) => {
		const response = await meetingController.updateMyEndedMeeting(req);
		res.status(201).json(response);
	},
);

// POST Generate summary, action items and tasks for a meeting
router.post("/:id/summarize", validate({ params: yupMongoId }), async (req: AuthenticatedRequest, res) => {
	const response = await meetingController.generateMyMeetingSummary(req);
	res.status(201).json(response);
});

export { router as meetingRoutes };
