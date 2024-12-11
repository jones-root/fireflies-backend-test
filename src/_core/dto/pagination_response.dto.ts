export interface IPaginationResponseDto<T = any[]> {
  total: number;
  limit: number;
  page: number;
  data: T;
}
