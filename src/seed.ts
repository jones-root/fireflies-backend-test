import "./_core/plugins/env.config.js";

import mongoose from "mongoose";
import { Meeting, IMeeting } from "./meeting/meeting.model.js";
import { Task, ITask } from "./task/task.model.js";
import { connectToMongoDB } from "./_core/plugins/mongo.config.js";
import { futureDate, randomDate, randomNumber } from "./_core/utils/index.js";

await connectToMongoDB();

const users = ["user1", "user2", "user3", "user4", "user5"];
const participants = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Henry", "Ivy", "Jack"];

function randomParticipants(): string[] {
	const count = randomNumber(2, 6);
	return participants.sort(() => 0.5 - Math.random()).slice(0, count);
}

async function seedMeetings() {
	await Meeting.deleteMany({});

	const meetings: IMeeting[] = [];

	for (let i = 0; i < 100; i++) {
		const userId = users[randomNumber(0, users.length - 1)];
		const meeting = new Meeting({
			userId: userId,
			title: `Meeting ${i + 1}`,
			date: randomDate(new Date(2023, 0, 1), new Date()),
			participants: randomParticipants(),
			transcript: `This is a sample transcript for meeting ${i + 1}.`,
			summary: `Summary of meeting ${i + 1}`,
			duration: randomNumber(15, 90),
			actionItems: Array.from({ length: randomNumber(1, 6) }).map((_, i) => `Action item 1 for meeting ${i + 1}`),
		});
		meetings.push(meeting);
	}

	await Meeting.insertMany(meetings);
	console.log("Meetings seeded successfully");
}

async function seedTasks() {
	await Task.deleteMany({});

	const meetings = await Meeting.find();
	const tasks: ITask[] = [];

	for (const meeting of meetings) {
		const taskCount = randomNumber(1, 3);
		for (let i = 0; i < taskCount; i++) {
			const task = new Task({
				meetingId: meeting._id,
				userId: meeting.userId,
				title: `Task ${i + 1} from ${meeting.title}`,
				description: `This is a sample task from meeting ${meeting.title}`,
				status: ["pending", "in-progress", "completed"][Math.floor(randomNumber(0, 2))],
				dueDate: futureDate(new Date(), 7), // Random date within a week of the meeting
			});
			tasks.push(task);
		}
	}

	await Task.insertMany(tasks);
	console.log("Tasks seeded successfully");
}

await seedMeetings();
await seedTasks();
await mongoose.connection.close();
