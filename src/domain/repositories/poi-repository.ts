import type { CursorPage, CursorPaginationParams, Point, RadiusQuery } from '../object-values';
import type { Poi } from '../models';
import { ReadRepository } from './read-repository';

export interface PoiRepository extends ReadRepository<Poi, string> {
  findByCategory(category: string, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findNear(point: Point, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findInRadius(query: RadiusQuery, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findInZone(zoneOsmId: string, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
}
