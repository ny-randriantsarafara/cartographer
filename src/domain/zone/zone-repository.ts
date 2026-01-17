import type { CursorPage, CursorPaginationParams, Point, ReadRepository } from "../shared/index.js";
import type { Zone } from "./zone.js";

export interface ZoneRepository extends ReadRepository<Zone, string> {
  findByType(zoneType: string, params: CursorPaginationParams): Promise<CursorPage<Zone>>;
  findContaining(point: Point): Promise<Zone[]>;
}
