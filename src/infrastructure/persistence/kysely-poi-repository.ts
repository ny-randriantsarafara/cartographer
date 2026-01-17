import type { Kysely } from "kysely";
import { sql } from "kysely";
import { Poi } from "../../domain/index.js";
import type { PoiRepository, Address } from "../../domain/index.js";
import type { CursorPage, CursorPaginationParams, Point, RadiusQuery } from "../../domain/index.js";
import type { DB, PoisTable } from "./schema.js";
import { buildCursorResponse, getCursorOsmId } from "./cursor-pagination.js";
import { wkbToGeoJSON } from "./geometry.js";

function mapRowToPoi(row: PoisTable): Poi {
  return new Poi(
    row.osm_id,
    wkbToGeoJSON(row.geometry),
    row.category,
    row.subcategory,
    row.name,
    row.address as Address | null,
    row.phone,
    row.opening_hours,
    row.price_range,
    row.website,
    row.tags as Record<string, unknown> | null,
    row.is_24_7,
    row.formatted_address,
    row.created_at ?? null,
    row.updated_at ?? null
  );
}

export class KyselyPoiRepository implements PoiRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async findById(osmId: string): Promise<Poi | null> {
    const row = await this.db
      .selectFrom("pois")
      .selectAll()
      .where("osm_id", "=", osmId)
      .executeTakeFirst();

    return row ? mapRowToPoi(row) : null;
  }

  async findAll(params: CursorPaginationParams): Promise<CursorPage<Poi>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("pois")
      .selectAll()
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const pois = rows.map(mapRowToPoi);

    return buildCursorResponse(pois, params.limit);
  }

  async findByCategory(category: string, params: CursorPaginationParams): Promise<CursorPage<Poi>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("pois")
      .selectAll()
      .where("category", "=", category)
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const pois = rows.map(mapRowToPoi);

    return buildCursorResponse(pois, params.limit);
  }

  async findNear(point: Point, params: CursorPaginationParams): Promise<CursorPage<Poi>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("pois")
      .selectAll()
      .orderBy(
        sql`ST_Distance(geometry, ST_SetSRID(ST_MakePoint(${point.lng}, ${point.lat}), 4326)::geography)`
      )
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const pois = rows.map(mapRowToPoi);

    return buildCursorResponse(pois, params.limit);
  }

  async findInRadius(query: RadiusQuery, params: CursorPaginationParams): Promise<CursorPage<Poi>> {
    const cursorOsmId = getCursorOsmId(params);
    const { center, radiusMeters } = query;

    let dbQuery = this.db
      .selectFrom("pois")
      .selectAll()
      .where(
        sql`ST_DWithin(
          geometry::geography,
          ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326)::geography,
          ${radiusMeters}
        )`,
        "=",
        sql`true`
      )
      .orderBy(
        sql`ST_Distance(geometry, ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326)::geography)`
      )
      .orderBy("osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      dbQuery = dbQuery.where("osm_id", ">", cursorOsmId);
    }

    const rows = await dbQuery.execute();
    const pois = rows.map(mapRowToPoi);

    return buildCursorResponse(pois, params.limit);
  }

  async findInZone(zoneOsmId: string, params: CursorPaginationParams): Promise<CursorPage<Poi>> {
    const cursorOsmId = getCursorOsmId(params);

    let query = this.db
      .selectFrom("pois")
      .innerJoin("zones", (join) =>
        join.on(
          sql`ST_Contains(zones.geometry, pois.geometry)`,
          "=",
          sql`true`
        )
      )
      .where("zones.osm_id", "=", zoneOsmId)
      .selectAll("pois")
      .orderBy("pois.osm_id", "asc")
      .limit(params.limit + 1);

    if (cursorOsmId) {
      query = query.where("pois.osm_id", ">", cursorOsmId);
    }

    const rows = await query.execute();
    const pois = rows.map(mapRowToPoi);

    return buildCursorResponse(pois, params.limit);
  }
}
