import wkx from 'wkx';
import type { GeoJSON } from 'geojson';

export function wkbToGeoJSON(wkbHex: string): GeoJSON.Geometry {
  const buffer = Buffer.from(wkbHex, 'hex');
  const geometry = wkx.Geometry.parse(buffer);
  return geometry.toGeoJSON() as GeoJSON.Geometry;
}
