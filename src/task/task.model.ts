import mongoose, { Document, Schema } from "mongoose";

export type TaskStatus = "pending" | "in-progress" | "completed";

export interface ITask extends Document {
	_id: mongoose.Types.ObjectId;

	/** Related meeting ID */
	meetingId: mongoose.Types.ObjectId;

	/** Owner of the related meeting. */
	userId: string;

	/** Title of the task */
	title: string;

	/** Specifics of the task */
	description: string;

	/** Status */
	status: TaskStatus;

	/** Due date */
	dueDate: Date;
}

const taskSchema = new Schema<ITask>({
	meetingId: { type: Schema.Types.ObjectId, ref: "Meeting" },
	userId: {
		type: String,
		required: true,
		index: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: String,
	status: {
		type: String,
		enum: ["pending", "in-progress", "completed"],
		default: "pending",
		index: true,
	},
	dueDate: {
		type: Date,
		required: true,
	},
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
