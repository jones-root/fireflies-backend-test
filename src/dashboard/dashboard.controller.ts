import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { dashboardService } from "./dashboard.service.js";
import { IDashboardDataDto } from "./dto/get_dashboard_response.dto.js";

export const dashboardController = {
	async getMyDashboard(req: AuthenticatedRequest): Promise<IDashboardDataDto> {
		return dashboardService.getDashboardByUserId(req.userId!);
	},
};
