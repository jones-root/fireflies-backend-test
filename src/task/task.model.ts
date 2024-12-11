import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  meetingId: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
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
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
