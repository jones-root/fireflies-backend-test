import { IMeeting } from "../../meeting/meeting.model.js";
import { ITask, Task } from "../../task/task.model.js";
import { futureDate, randomNumber, sleep } from "../utils/index.js";

export const llm = {
	async summarizeMeeting(userId: string, meeting: IMeeting): Promise<{ summary: string; tasks: ITask[] }> {
		await sleep(2000);

		return {
			summary: `Summary of meeting ${meeting._id} from a transcription of ${meeting.transcript.length} chars`,
			tasks: Array.from({ length: randomNumber(1, 5) }).map(
				(_, index) =>
					new Task({
						title: `Task ${index + 1} for ${meeting.title}`,
						description: `Sample description for ${meeting.title}`,
						meetingId: meeting._id,
						dueDate: futureDate(new Date(), 7),
						status: "pending",
						userId,
					}),
			),
		};
	},
};
