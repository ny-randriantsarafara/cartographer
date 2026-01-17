import type { CursorPage, CursorPaginationParams, Point, RadiusQuery, ReadRepository } from "../shared/index.js";
import type { Poi } from "./poi.js";

export interface PoiRepository extends ReadRepository<Poi, string> {
  findByCategory(category: string, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findNear(point: Point, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findInRadius(query: RadiusQuery, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
  findInZone(zoneOsmId: string, params: CursorPaginationParams): Promise<CursorPage<Poi>>;
}
