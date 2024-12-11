import Yup from "yup";

export const UpdateEndedMeetingDto = Yup.object({
	transcript: Yup.string() //
		.required()
		.min(3)
		.max(2 ** 16),
	duration: Yup.number() //
		.required()
		.min(0)
		.max(24 * 60), // 1 day
});

export type IUpdateEndedMeetingDto = Yup.InferType<typeof UpdateEndedMeetingDto>;
