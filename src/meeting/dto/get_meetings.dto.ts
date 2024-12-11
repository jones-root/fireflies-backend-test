import Yup from "yup";

export const GetMeetingsDto = Yup.object({
  page: Yup.number() //
    .integer()
    .required()
    .min(1),
  limit: Yup.number() //
    .integer()
    .required()
    .min(1)
    .max(100),
});

export type IGetMeetingsDto = Yup.InferType<typeof GetMeetingsDto>;
