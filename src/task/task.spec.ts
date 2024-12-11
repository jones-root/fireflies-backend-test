import { Meeting } from "../meeting/meeting.model";
import { AuthenticatedRequest } from "../user/auth.middleware";
import { taskController } from "./task.controller";
import { taskRepository } from "./task.repository";

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
  test("Should return all requesting user tasks", async () => {
    // Mock repository query
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
    const result = await taskController.getMyTasks(req);

    expect(taskRepository.getAll).toHaveBeenCalledTimes(1);
    mockedMeetings.forEach((mock, index) => {
      expect(result.data[index]).toMatchObject(mock);
    });
    expect(result.data).toHaveLength(2);
    expect(result.total).toEqual(2);
  });
});
