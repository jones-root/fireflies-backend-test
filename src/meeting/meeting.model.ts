import mongoose, { Document, Schema } from "mongoose";
import { ITask } from "../task/task.model";

export interface IMeeting extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  title: string;
  date: Date;
  participants: string[];
  transcript: string;
  summary: string;
  actionItems: string[];

  // local
  tasks: ITask[];
}

const meetingSchema = new Schema<IMeeting>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  participants: {
    type: [String],
    required: true,
  },
  transcript: String,
  summary: String,
  actionItems: [String],
});

export const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
