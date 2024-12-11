import Yup from "yup";

export const CreateMeetingDto = Yup.object({
	title: Yup.string() //
		.required()
		.min(3)
		.max(2 ** 7),
	date: Yup.string() //
		.required()
		.datetime()
		.test({
			message: "date must be after the current time",
			test: date => {
				const now = new Date();
				return new Date(date) > now;
			},
		}),
	participants: Yup.array(
		Yup.string()
			.min(3)
			.max(2 ** 6),
	)
		.min(1)
		.max(2 ** 6),
});

export type ICreateMeetingDto = Yup.InferType<typeof CreateMeetingDto>;
