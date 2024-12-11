import Yup from "yup";

export const PaginationDto = Yup.object({
  page: Yup.number() //
    .integer()
    .optional()
    .min(1),
  limit: Yup.number() //
    .integer()
    .optional()
    .min(1)
    .max(100),
});

export type IPaginationDto = Yup.InferType<typeof PaginationDto>;
