import type { CursorPage, CursorPaginationParams, Point } from '../object-values';
import type { ReadRepository } from './read-repository';
import type { Zone } from '../models';

export interface ZoneRepository extends ReadRepository<Zone, string> {
  findByType(zoneType: string, params: CursorPaginationParams): Promise<CursorPage<Zone>>;
  findContaining(point: Point): Promise<Zone[]>;
}
