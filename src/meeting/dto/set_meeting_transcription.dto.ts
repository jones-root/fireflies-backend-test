import Yup from "yup";

export const SetMeetingTranscriptionDto = Yup.object({
  transcription: Yup.string() //
    .required()
    .min(3)
    .max(2 ** 16),
});

export type ISetMeetingTranscriptionDto = Yup.InferType<
  typeof SetMeetingTranscriptionDto
>;
