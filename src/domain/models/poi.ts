import type { GeoJSON } from "geojson";

export interface Address {
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
  [key: string]: unknown;
}

export class Poi {
  constructor(
    public readonly osmId: string,
    public readonly geometry: GeoJSON.Geometry,
    public readonly category: string,
    public readonly subcategory: string | null,
    public readonly name: string | null,
    public readonly address: Address | null,
    public readonly phone: string | null,
    public readonly openingHours: string | null,
    public readonly priceRange: number | null,
    public readonly website: string | null,
    public readonly tags: Record<string, unknown> | null,
    public readonly is247: boolean | null,
    public readonly formattedAddress: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null
  ) {}
}
