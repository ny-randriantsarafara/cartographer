import type { Kysely } from "kysely";
import { sql } from "kysely";
import { Zone } from "../../domain/index.js";
import type { ZoneRepository } from "../../domain/index.js";
import type { CursorPage, CursorPaginationParams, Point } from "../../domain/index.js";
import type { DB, ZonesTable } from "./schema.js";
import { buildCursorResponse, getCursorOsmId } from "./cursor-pagination.js";
import { wkbToGeoJSON } from "./geometry.js";

function mapRowToZone(row: ZonesTable): Zone {
  return new Zone(
    row.osm_id,
    wkbToGeoJSON(row.geometry),
    row.name,
    row.malagasy_name,
    row.iso_code,
    row.population,
    row.tags as Record<string, unknown> | null,
    row.area,
    row.centroid ? wkbToGeoJSON(row.centroid) : null,
    row.zone_type,
    row.created_at ?? null,
    row.updated_at ?? null
  );
}

export class KyselyZoneRepository implements ZoneRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async findById(osmId: string): Promise<Zone | null> {
    const row = await this.db
      .selectFrom("zones")
      .selectAll()
      .where("osm_id", "=", osmId)
      .executeTakeFirst();

    return row ? mapRowToZone(row) : null;
  }

  async findAll(params: CursorPaginationParams): Promise<CursorPage<Zone>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("zones")
      .selectAll()
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const zones = rows.map(mapRowToZone);

    return buildCursorResponse(zones, params.limit);
  }

  async findByType(zoneType: string, params: CursorPaginationParams): Promise<CursorPage<Zone>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("zones")
      .selectAll()
      .where("zone_type", "=", zoneType)
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const zones = rows.map(mapRowToZone);

    return buildCursorResponse(zones, params.limit);
  }

  async findContaining(point: Point): Promise<Zone[]> {
    const rows = await this.db
      .selectFrom("zones")
      .selectAll()
      .where(
        sql`ST_Contains(geometry, ST_SetSRID(ST_MakePoint(${point.lng}, ${point.lat}), 4326))`,
        "=",
        sql`true`
      )
      .orderBy("area", "asc")
      .execute();

    return rows.map(mapRowToZone);
  }
}
