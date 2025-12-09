export interface PaginationResult<T> {
  page: number;
  pageSize: number;
  totalItems: number;
  items: T[];
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
