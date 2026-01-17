export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}
