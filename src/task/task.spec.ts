import { Meeting } from "../meeting/meeting.model.js";
import { AuthenticatedRequest } from "../user/auth.middleware.js";
import { taskController } from "./task.controller.js";
import { taskRepository } from "./task.repository.js";

// Mocks the repository
jest.mock("./task.repository.ts", () => {
	return {
		taskRepository: {
			insertMany: jest.fn(),
			getAll: jest.fn(),
			getDashboardByUserId: jest.fn(),
			getAnalyticsByUserId: jest.fn(),
		},
	};
});

describe("Task Controller", () => {
	// Unit test the endpoint handler
	test("Should return all requesting user tasks", async () => {
		// Mock the repository query to retrieve meetings used by the `getMyTasks` endpoint
		const mockedMeetings = [
			new Meeting({
				title: "Daily standup",
				date: new Date(),
				participants: ["Webber", "John"],
			}),
			new Meeting({
				title: "Operational",
				date: new Date(),
				participants: ["Webber", "Alice"],
			}),
		];
		(<jest.Mock>taskRepository.getAll).mockResolvedValue(mockedMeetings);

		const req = <AuthenticatedRequest>{ userId: "userId" };

		// Directly call the controller endpoint handler without passing through the HTTP layer, middlewares, etc.
		const result = await taskController.getMyTasks(req);

		expect(taskRepository.getAll).toHaveBeenCalledTimes(1);
		mockedMeetings.forEach((mock, index) => {
			expect(result.data[index]).toMatchObject(mock);
		});
		expect(result.data).toHaveLength(2);
		expect(result.total).toEqual(2);
	});
});
