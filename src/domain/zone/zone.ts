import type { GeoJSON } from "geojson";

export class Zone {
  constructor(
    public readonly osmId: string,
    public readonly geometry: GeoJSON.Geometry,
    public readonly name: string,
    public readonly malagasyName: string | null,
    public readonly isoCode: string | null,
    public readonly population: number | null,
    public readonly tags: Record<string, unknown> | null,
    public readonly area: number | null,
    public readonly centroid: GeoJSON.Geometry | null,
    public readonly zoneType: string,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}
}
