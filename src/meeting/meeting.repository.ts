import { IPaginationDto } from "../_core/dto/pagination.dto";
import { IMeeting, Meeting } from "./meeting.model";

export const meetingRepository = {
  async updateAndGet(
    { id, ...criteria }: Partial<Pick<IMeeting, "id" | "userId">>,
    partial: Partial<IMeeting>
  ) {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: id, ...criteria },
      { $set: partial },
      { new: true }
    );

    if (meeting) {
      return meeting.toObject({ versionKey: false });
    }

    return meeting;
  },

  async getById(id: string, options?: { userId?: string }) {
    return Meeting.findOne({ _id: id, userId: options?.userId }, { __v: 0 });
  },

  async getAllByUserId(
    userId: string,
    { page, limit }: IPaginationDto = { page: 1, limit: 36 }
  ) {
    return Meeting.find(
      { userId },
      { __v: 0 },
      {
        sort: { date: -1 },
        skip: (page! - 1) * limit!,
        limit: limit,
      }
    );
  },

  async getAnalyticsByUserId(userId: string) {
    const [meetingsResult] = await Meeting.aggregate([
      {
        $match: { userId },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          date: 1,
          participants: 1,
          transcript: 1,
          summary: 1,
          actionItems: 1,
          duration: 1,
          transcriptLength: { $strLenCP: "$transcript" },
        },
      },
      {
        $facet: {
          generalStats: [
            {
              $group: {
                _id: null,
                totalMeetings: { $sum: 1 },
                totalParticipants: { $sum: { $size: "$participants" } },
                averageParticipants: { $avg: { $size: "$participants" } },
                shortestMeeting: { $min: "$duration" },
                longestMeeting: { $max: "$duration" },
                averageDuration: { $avg: "$duration" },
                averageTranscriptLength: { $avg: "$transcriptLength" },
                averageActionItems: { $avg: { $size: "$actionItems" } },
              },
            },
          ],
          topParticipants: [
            { $unwind: "$participants" },
            {
              $group: {
                _id: "$participants",
                meetingCount: { $sum: 1 },
              },
            },
            { $project: { name: "$_id", meetingCount: 1 } },
            { $sort: { meetingCount: -1 } },
            { $limit: 5 },
          ],
          meetingsByDayOfWeek: [
            {
              $group: {
                _id: { $dayOfWeek: "$date" },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                dayOfWeek: "$_id",
                count: 1,
              },
            },
          ],
          distinctParticipants: [
            { $unwind: "$participants" },
            {
              $group: {
                _id: null,
                distinctParticipants: { $addToSet: "$participants" },
              },
            },
          ],
        },
      },
    ]);

    return meetingsResult;
  },
};
