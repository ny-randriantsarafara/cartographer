export interface PoisTable {
  osm_id: string;
  geometry: string;
  category: string;
  subcategory: string | null;
  name: string | null;
  address: unknown | null;
  phone: string | null;
  opening_hours: string | null;
  price_range: number | null;
  website: string | null;
  tags: unknown | null;
  created_at: Date | null;
  updated_at: Date | null;
  is_24_7: boolean | null;
  formatted_address: string | null;
}

export interface ZonesTable {
  osm_id: string;
  geometry: string;
  name: string;
  malagasy_name: string | null;
  iso_code: string | null;
  population: number | null;
  tags: unknown | null;
  created_at: Date | null;
  updated_at: Date | null;
  area: number | null;
  centroid: string | null;
  zone_type: string;
}

export interface DB {
  pois: PoisTable;
  zones: ZonesTable;
}
