import type { CursorPage, CursorPaginationParams } from '../object-values';

export interface ReadRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(params: CursorPaginationParams): Promise<CursorPage<T>>;
}
