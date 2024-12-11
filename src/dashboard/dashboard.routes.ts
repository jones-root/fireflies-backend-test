import express from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { Meeting } from "../meeting/meeting.model.js";
import { Task } from "../task/task.model.js";
import { Types } from "mongoose";
import { meetingRepository } from "../meeting/meeting.repository.js";
import { taskRepository } from "../task/task.repository.js";

interface IUpcomingMeeting {
  _id: Types.ObjectId;
  title: string;
  date: Date;
  participantCount: number;
}

interface IOverdueTask {
  _id: Types.ObjectId;
  title: string;
  dueDate: Date;
  meetingId: Types.ObjectId;
  meetingTitle: string;
}

interface IDashboardData {
  totalMeetings: number;
  taskSummary: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  upcomingMeetings: IUpcomingMeeting[];
  overdueTasks: IOverdueTask[];
}

const router = express.Router();

router.get("/", async (req: AuthenticatedRequest, res) => {
  const [meetingsResult, tasksResult] = await Promise.all([
    meetingRepository.getDashboardByUserId(req.userId!),
    taskRepository.getDashboardByUserId(req.userId!),
  ]);

  const taskSummary = {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  tasksResult.tasksDistribution?.forEach((item: any) => {
    switch (item.status) {
      case "completed": {
        taskSummary.completed = item.count;
        break;
      }
      case "in-progress": {
        taskSummary.inProgress = item.count;
        break;
      }
      case "pending": {
        taskSummary.pending = item.count;
        break;
      }
    }
  });

  const { count: totalMeetings } = meetingsResult.totalMeetings?.[0] ?? {};

  const dashboardData: IDashboardData = {
    totalMeetings,
    taskSummary,
    upcomingMeetings: meetingsResult.upcomingMeetings ?? [],
    overdueTasks: tasksResult.overdueTasks ?? [],
  };

  res.json(dashboardData);
});

export { router as dashboardRoutes };
