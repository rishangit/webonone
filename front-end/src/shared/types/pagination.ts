/** Shared pagination shape used by list APIs across features. */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  totalPages: number;
  currentPage: number;
}
