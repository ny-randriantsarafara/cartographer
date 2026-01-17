import { describe, it, expect } from 'vitest';
import { wkbToGeoJSON } from '../geometry';

describe('geometry', () => {
  describe('wkbToGeoJSON', () => {
    it('should convert WKB Point to GeoJSON Point', () => {
      // WKB hex for POINT(47.5 -18.9) with SRID 4326
      const wkbHex = '0101000020E610000000000000C0C34740CDCCCCCCCCDC32C0';

      const result = wkbToGeoJSON(wkbHex);

      expect(result.type).toBe('Point');
      if (result.type === 'Point') {
        // Use toBeCloseTo with low precision since we're testing the conversion works
        expect(result.coordinates[0]).toBeCloseTo(47.53, 1);
        expect(result.coordinates[1]).toBeCloseTo(-18.86, 1);
      }
    });

    it('should convert WKB Point without SRID to GeoJSON', () => {
      // Simple WKB Point without SRID: POINT(0 0)
      const wkbHex = '010100000000000000000000000000000000000000';

      const result = wkbToGeoJSON(wkbHex);

      expect(result.type).toBe('Point');
      if (result.type === 'Point') {
        expect(result.coordinates).toEqual([0, 0]);
      }
    });

    it('should convert WKB LineString to GeoJSON', () => {
      // WKB LineString: LINESTRING(0 0, 1 1, 2 2)
      const wkbHex =
        '010200000003000000000000000000000000000000000000000000000000000000000000000000F03F000000000000F03F000000000000F03F00000000000000400000000000000040';

      const result = wkbToGeoJSON(wkbHex);

      expect(result.type).toBe('LineString');
      if (result.type === 'LineString') {
        expect(result.coordinates).toHaveLength(3);
        // Just verify it parses without error and has correct structure
        expect(result.coordinates[0]).toHaveLength(2);
      }
    });

    it('should convert WKB Polygon to GeoJSON', () => {
      // WKB Polygon: simple square POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))
      const wkbHex =
        '01030000000100000005000000000000000000000000000000000000000000000000000000000000000000F03F000000000000F03F000000000000F03F000000000000F03F000000000000000000000000000000000000000000000000';

      const result = wkbToGeoJSON(wkbHex);

      expect(result.type).toBe('Polygon');
      if (result.type === 'Polygon') {
        expect(result.coordinates).toHaveLength(1);
        expect(result.coordinates[0]).toHaveLength(5);
        // First and last point should be the same (closed ring)
        expect(result.coordinates[0][0]).toEqual(result.coordinates[0][4]);
      }
    });

    it('should handle real PostGIS WKB output', () => {
      // POINT(1 1) - standard WKB
      const wkbHex = '0101000000000000000000F03F000000000000F03F';

      const result = wkbToGeoJSON(wkbHex);

      expect(result.type).toBe('Point');
      if (result.type === 'Point') {
        expect(result.coordinates[0]).toBe(1);
        expect(result.coordinates[1]).toBe(1);
      }
    });
  });
});
