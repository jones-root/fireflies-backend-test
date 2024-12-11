import { meetingRepository } from "../meeting/meeting.repository";
import { taskRepository } from "../task/task.repository";
import { AuthenticatedRequest } from "../user/auth.middleware";
import { IDashboardDataDto } from "./dto/get_dashboard_response.dto";

export const dashboardController = {
  async getMyDashboard(req: AuthenticatedRequest): Promise<IDashboardDataDto> {
    const [meetingsResult, tasksResult] = await Promise.all([
      meetingRepository.getDashboardByUserId(req.userId!),
      taskRepository.getDashboardByUserId(req.userId!),
    ]);

    const taskSummary = {
      pending: 0,
      inProgress: 0,
      completed: 0,
    };

    tasksResult.tasksDistribution?.forEach((item) => {
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

    return {
      totalMeetings: totalMeetings ?? 0,
      taskSummary,
      upcomingMeetings: meetingsResult.upcomingMeetings ?? [],
      overdueTasks: tasksResult.overdueTasks ?? [],
    };
  },
};
